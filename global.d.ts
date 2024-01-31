interface Env {
  DB: import('./src/backend/DB').D1TypedDatabase
  GOOGLE_CLIENT_SECRET_JSON: string
  ORIGIN: string
  ctx: import('./src/backend/WorkerUtils').AnyCtx
  [key: string]: string | null
}

/** Backend environment */
declare const env: Env

declare const google: typeof import('@types/google.accounts')
