interface Env {
  GOOGLE_CLIENT_SECRET_JSON: string
  ORIGIN: string
  OPENAI_API_KEY: string
  YOUTUBE_API_KEY: string
  [key: string]: string | null
}

/** Backend environment */
declare const env: Env

declare const google: typeof import('@types/google.accounts')
