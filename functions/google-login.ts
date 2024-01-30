import { verifyIdToken, getGoogleConfig } from '../src/backend/Google'
import { uuid } from '@cfworker/uuid'
import { upsert } from '../src/backend/DB'
import { User } from '../src/types/DB'
import { unauth } from '../src/backend/WorkerUtils'
import { redactUser } from '../src/backend/User'

export const onRequestPost = unauth(async (ctx) => {
  // Get JWT from URL
  const url = new URL(ctx.request.url)
  const token = url.searchParams.get('token')!

  // Verify JWT
  const payload = await verifyIdToken({
    idToken: token,
    clientId: getGoogleConfig().web.client_id,
  })

  // Create/update the user
  const user = redactUser(
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
      { table: 'user', conflictKey: 'email', updateFields: ['google_id', 'image', 'locale'] }
    )
  )

  return new Response(JSON.stringify(user), {
    headers: {
      'Set-Cookie': `token=${token}; path=/; secure; httponly; samesite=strict;`,
    },
  })
})
