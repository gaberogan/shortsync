import type { EventContext } from '@cloudflare/workers-types'
import { parse } from 'cookie'
import { verifyIdToken, getClientConfig } from '../src/backend/Google'

export async function onRequest(ctx: EventContext<any, any, any>) {
  // @ts-ignore Make env a global variable
  globalThis.env = ctx.env

  // TODO this is a test endpoint

  const cookie = parse(ctx.request.headers.get('Cookie') || '')

  const payload = await verifyIdToken({
    idToken: cookie['token'],
    // Reuse our YouTube client_id, it's the same one
    clientId: getClientConfig().web.client_id,
  })

  return new Response(JSON.stringify(payload, null, 2))
}
