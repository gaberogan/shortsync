// interface Env {
//   GOOGLE_CLIENT_SECRET_JSON: string
//   ORIGIN: string
//   OPENAI_API_KEY: string
//   YOUTUBE_API_KEY: string
//   [key: string]: string | undefined
// }

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FOO: string
      BAR: number
    }
  }
}

type FastifyInstance = import('fastify').FastifyInstance

type FastifyRouteOptions = Parameters<FastifyInstance['route']>[0]

declare const google: typeof import('@types/google.accounts')
