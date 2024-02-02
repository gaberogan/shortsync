interface Env {
  DB: import('./backend/DB').D1TypedDatabase
  GOOGLE_CLIENT_SECRET_JSON: string
  ORIGIN: string
  OPENAI_API_KEY: string
  YOUTUBE_API_KEY: string
  ctx: import('./backend/WorkerUtils').AnyCtx
  [key: string]: string | null
}

/** Backend environment */
declare const env: Env

declare const google: typeof import('@types/google.accounts')
