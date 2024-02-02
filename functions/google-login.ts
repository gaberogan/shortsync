import { verifyIdToken, getGoogleConfig } from '../backend/Google'
import { uuid } from '@cfworker/uuid'
import { User } from '../src/types/DB'
import { unauth } from '../backend/WorkerUtils'
import { upsertQuery } from '../backend/DB'
import { fetchUserWithChannelsRedacted } from '../backend/User'

export const onRequestPost = unauth(async (ctx) => {
  // Get JWT from URL
  const url = new URL(ctx.request.url)
  const token = url.searchParams.get('token')!

  // Verify JWT
  const jwt = await verifyIdToken({
    idToken: token,
    clientId: getGoogleConfig().web.client_id,
  })

  // Create/update the user
  await upsertQuery<User>(
    {
      id: uuid(),
      google_id: jwt.sub as string,
      email: jwt.email as string,
      image: jwt.picture as string,
      first_name: jwt.given_name as string,
      last_name: jwt.family_name as string,
      locale: jwt.locale as string,
    },
    { table: 'user', uniqueKey: 'email', updateColumns: ['google_id', 'image', 'locale'] }
  ).run()

  // Return user and create session
  const user = await fetchUserWithChannelsRedacted(jwt.email as string)
  return new Response(JSON.stringify(user), {
    headers: {
      'Set-Cookie': `token=${token}; path=/; secure; httponly; samesite=strict;`,
    },
  })
})
