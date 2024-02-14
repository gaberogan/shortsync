import { parse } from 'cookie'
import { getGoogleConfig, verifyIdToken } from './Google'
import { JWTPayload } from 'jose'

export type AnyCtx = EventContext<any, any, any>

/**
 * Wrap an authenticated endpoint
 */
export const auth = (callback: (ctx: AnyCtx, jwt: JWTPayload) => Promise<Response>) => async (ctx: AnyCtx) => {
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
