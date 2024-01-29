import type { EventContext } from '@cloudflare/workers-types'
import { verifyIdToken, getClientConfig } from '../src/backend/Google'
import { uuid } from '@cfworker/uuid'
import { upsert } from '../src/backend/DB'
import { User } from '../src/types/DB'

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
    clientId: getClientConfig().web.client_id,
  })

  // Create/update the user
  const user = await upsert<User>(
    {
      id: uuid(),
      google_id: payload.sub as string,
      email: payload.email as string,
      image: payload.picture as string,
      first_name: payload.given_name as string,
      last_name: payload.family_name as string,
      locale: payload.locale as string,
    },
    { table: 'user', conflictKey: 'email', updateFields: ['google_id', 'image', 'locale'] }
  )

  return new Response(JSON.stringify(user), {
    headers: {
      'Set-Cookie': `token=${token}; path=/; secure; httponly; samesite=strict;`,
    },
  })
}
