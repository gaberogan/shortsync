import solid from 'vite-plugin-solid'
import { defineConfig } from 'vite'
import cloudflarePages from './vite-plugin-cloudflare-pages'
import mkcert from 'vite-plugin-mkcert'

const PORT = 443

export default defineConfig({
  plugins: [solid(), cloudflarePages(), mkcert({ hosts: ['dev.shortsync.app'] })],
  server: {
    host: 'dev.shortsync.app',
    port: PORT,
    hmr: {
      port: PORT,
    },
  },
  build: {
    target: 'esnext',
  },
})
