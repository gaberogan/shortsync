import { parse } from 'cookie'
import { getGoogleConfig, verifyIdToken } from './Google'
import { JWTPayload } from 'jose'

export type AnyCtx = EventContext<any, any, any>

/**
 * Wrap an authenticated endpoint
 */
export const auth = (callback: (ctx: AnyCtx, jwt: JWTPayload) => Promise<Response>) => async (ctx: AnyCtx) => {
  initEnv(ctx)

  const token = parse(ctx.request.headers.get('Cookie') || '')['token']

  if (!token) {
    return new Response('Not logged in', { status: 401 })
  }

  const payload = await verifyIdToken({
    idToken: token,
    clientId: getGoogleConfig().web.client_id,
  })

  return await callback(ctx, payload)
}

/**
 * Wrap an unauthenticated endpoint
 */
export const unauth = (callback: (ctx: AnyCtx) => Promise<Response>) => async (ctx: AnyCtx) => {
  initEnv(ctx)

  return await callback(ctx)
}

const initEnv = (ctx: AnyCtx) => {
  // Workers remain alive for multiple requests, detect if this is the first request
  // @ts-ignore
  const firstInit = !globalThis.env

  // Create the global env variable
  if (firstInit) {
    // @ts-ignore
    globalThis.env = ctx.env
  }

  // Set request context to a global variable
  // env.ctx = ctx

  // Override the DB batch function for better types
  // This is a TypeScript limitation, see ./DB.ts for type definitions
  if (firstInit && env.DB) {
    // @ts-ignore
    env.DB.oldBatch = env.DB.batch
    env.DB.batch = function (...args) {
      // @ts-ignore
      return env.DB.oldBatch(args)
    }
  }
}
