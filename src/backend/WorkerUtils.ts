import { parse } from 'cookie'
import { getGoogleConfig, verifyIdToken } from './Google'
import { JWTPayload } from 'jose'

export type AnyCtx = EventContext<any, any, any>

/**
 * Wrap an authenticated endpoint
 */
export const auth = (callback: (ctx: AnyCtx, jwt: JWTPayload) => Promise<Response>) => async (ctx: AnyCtx) => {
  // @ts-ignore Make env a global variable
  globalThis.env = ctx.env

  const cookie = parse(ctx.request.headers.get('Cookie') || '')
  const token = cookie['token']

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
  // @ts-ignore Make env a global variable
  globalThis.env = ctx.env

  return await callback(ctx)
}
