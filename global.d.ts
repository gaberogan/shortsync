interface Env {
  DB: import('@cloudflare/workers-types').D1Database
  YOUTUBE_CLIENT_SECRET_JSON: string
  ORIGIN: string
  JWT_SECRET: string
  [key: string]: string | null
}

declare const env: Env

declare const google: typeof import('@types/google.accounts')
