import type { EventContext } from '@cloudflare/workers-types'
import { getAuthConfig } from '../src/services/Youtube'
import { verifyIdToken } from '../src/services/GoogleJWT'
import { uuid } from '@cfworker/uuid'
import { User, upsert } from '../src/services/DB'

export async function onRequest(ctx: EventContext<any, any, any>) {
  // @ts-ignore Make env a global variable
  globalThis.env = ctx.env

  // Get JWT from URL
  const url = new URL(ctx.request.url)
  const token = url.searchParams.get('token')!

  // Verify JWT
  const payload = await verifyIdToken({
    idToken: token,
    // Reuse our YouTube client_id, it's the same one
    clientId: getAuthConfig().web.client_id,
  })

  await upsert<User>(
    {
      id: uuid(),
      google_id: payload.sub as string,
      email: payload.email as string,
      image: payload.picture as string,
      first_name: payload.given_name as string,
      last_name: payload.family_name as string,
      locale: payload.locale as string,
    },
    { table: 'user', conflictKey: 'google_id' }
  )

  return new Response(JSON.stringify(payload, null, 2))
}
