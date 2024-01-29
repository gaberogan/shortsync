interface Env {
  DB: import('@cloudflare/workers-types').D1Database
  [key: string]: string | null
}

declare const env: Env

declare const google: typeof import('@types/google.accounts')
