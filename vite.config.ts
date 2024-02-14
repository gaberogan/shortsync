import solid from 'vite-plugin-solid'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

const HOST = 'dev.shortsync.app'
const PORT = 443

export default defineConfig({
  plugins: [solid(), mkcert({ hosts: [HOST] })],
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
