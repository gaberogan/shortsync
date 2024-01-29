import solid from 'vite-plugin-solid'
import { defineConfig } from 'vite'
import cloudflarePages from './vite-plugin-cloudflare-pages'
import mkcert from 'vite-plugin-mkcert'

const HOST = 'dev.shortsync.app'
const PORT = 443

export default defineConfig({
  plugins: [solid(), cloudflarePages(), mkcert({ hosts: [HOST] })],
  server: {
    host: HOST,
    port: PORT,
    hmr: {
      port: PORT,
    },
  },
  build: {
    target: 'esnext',
  },
})
