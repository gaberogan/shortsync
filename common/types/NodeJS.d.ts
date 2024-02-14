declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_CLIENT_SECRET_JSON: string
      ORIGIN: string
      OPENAI_API_KEY: string
      YOUTUBE_API_KEY: string
      [key: string]: string | undefined
    }
  }
}

// Must tell TypeScript this is a module to allow overriding types
export {}
