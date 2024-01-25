import fs from 'fs'
import { exec } from 'child_process'

const WRANGLER_ORIGIN = `http://localhost:8788`

/**
 * CloudFlare Pages Vite Plugin
 * TODO: does not support /[[wildcards]].ts
 */
export default function cloudflarePages() {
  // TODO how to know when server is running
  exec('wrangler pages dev ./functions')

  // Use _routes.json to match production behavior
  // See https://developers.cloudflare.com/pages/functions/routing/#create-a-_routesjson-file
  const routesJson = JSON.parse(fs.readFileSync('./public/_routes.json'))
  const includes = routesJson.include

  // Configure the Vite Proxy
  // See https://vitejs.dev/config/server-options.html#server-proxy
  // e.g. { '/api': {} } proxies /api to nowhere to allow override
  const proxy = Object.fromEntries(includes.map((x) => [x, WRANGLER_ORIGIN]))

  return {
    name: 'cloudflare-pages-plugin',
    config() {
      return {
        server: { proxy },
        preview: { proxy },
      }
    },
  }
}
