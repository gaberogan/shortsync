import solid from 'vite-plugin-solid'
import { defineConfig } from 'vite'
import cloudflarePages from './vite-plugin-cloudflare-pages'

const PORT = 3000

export default defineConfig({
  plugins: [solid(), cloudflarePages()],
  server: {
    port: PORT,
    hmr: {
      port: PORT,
    },
  },
  build: {
    target: 'esnext',
  },
})
