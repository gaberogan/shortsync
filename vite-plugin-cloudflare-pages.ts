import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import TOML from '@iarna/toml'

const WRANGLER_ORIGIN = `http://localhost:8788`

/**
 * CloudFlare Pages Vite Plugin
 * TODO: does not support /[wildcards].ts
 * TODO: live reload does not always work
 */
export default function cloudflarePages() {
  // Generate _routes.json from functions
  const routesJson = {
    version: 1,
    include: getFilesRelative('./functions').map(fileToEndpoint),
    exclude: [],
  }

  // Generate _routes.json
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist')
  }
  fs.writeFileSync('./dist/_routes.json', JSON.stringify(routesJson))

  // Configure the Vite Proxy
  // See https://vitejs.dev/config/server-options.html#server-proxy
  // e.g. { '/api': 'http://localhost:8788' } proxies /api to wrangler
  const proxy = Object.fromEntries(routesJson.include.map((x: any) => [x, WRANGLER_ORIGIN]))

  return {
    name: 'cloudflare-pages-plugin',
    config(config: any, env: any) {
      if (env.mode === 'development') {
        startWranglerServer()
      }

      return {
        server: { proxy },
        preview: { proxy },
      }
    },
  }
}

/**
 * Start a CloudFlare Wrangler server in ./functions using wrangler.toml
 */
function startWranglerServer() {
  const toml = TOML.parse(fs.readFileSync('./wrangler.toml', 'utf-8'))

  const compatDate = toml.compatibility_date ? `--compatibility-date=${toml.compatibility_date}` : ''

  const dbs = (toml.d1_databases || []) as any[]
  const d1 = dbs.map((x) => `--d1=${x.binding}=${x.database_id}`).join(' ')

  const kvs = (toml.kv_namespaces || []) as any[]
  const kv = kvs.map((x) => `--kv=${x.binding}`).join(' ')

  const r2s = (toml.r2_buckets || []) as any[]
  const r2 = r2s.map((x) => `--r2=${x.binding}`).join(' ')

  const command = `wrangler pages dev ./functions ${compatDate} ${d1} ${kv} ${r2}`

  exec(command)
}

/**
 * Recursively get all files in a folder, return absolute paths
 * e.g. ['/Users/me/folder/file.txt']
 */
function getFilesAbsolute(dir: string): string[] {
  const dirents = fs.readdirSync(dir, { withFileTypes: true })
  const files = dirents.map((dirent) => {
    const absolutePath = path.resolve(dir, dirent.name)
    return dirent.isDirectory() ? getFilesAbsolute(absolutePath) : absolutePath
  })
  return Array.prototype.concat(...files)
}

/**
 * Recursively get all files in a folder, return relative paths
 * e.g. ['folder/file.txt']
 */
function getFilesRelative(dir: string): string[] {
  const absolutePaths = getFilesAbsolute(dir)
  return absolutePaths.map((file) => path.relative(dir, file))
}

/**
 * e.g. foo/bar.js -> /foo/bar
 */
function fileToEndpoint(file: string): string {
  return '/' + removeExtensionFromFile(file)
}

/**
 * e.g. foo/bar.js -> foo/bar
 */
function removeExtensionFromFile(file: string): string {
  return file.substring(0, file.lastIndexOf('.')) || file
}
