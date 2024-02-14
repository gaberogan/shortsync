import { verifyIdToken, getGoogleConfig } from '@api/services/Google'
import { User } from '@common/types/DB'
import { upsertQuery } from '@api/services/DB'
import { fetchRedactedUser } from '@api/services/User'
import { auth } from '@api/services/Auth'
import { v4 as uuidv4 } from 'uuid'

export default {
  method: 'POST',
  url: '/google-login',
  schema: {},
  preHandler: [auth],
  handler: async (request, reply) => {
    // Get JWT from URL
    const url = new URL(request.url)
    const token = url.searchParams.get('token')!

    // Verify JWT
    const jwt = await verifyIdToken({
      idToken: token,
      clientId: getGoogleConfig().web.client_id,
    })

    // Create/update the user
    await upsertQuery<User>(
      {
        id: uuidv4(),
        google_id: jwt.sub as string,
        email: jwt.email as string,
        image: jwt.picture as string,
        first_name: jwt.given_name as string,
        last_name: jwt.family_name as string,
        locale: jwt.locale as string,
      },
      { table: 'user', uniqueKey: 'email', updateColumns: ['google_id', 'image', 'locale'] }
    ).run()

    reply.header('Set-Cookie', `token=${token}; path=/; secure; httponly; samesite=strict;`)

    return await fetchRedactedUser(jwt.email as string)
  },
} as FastifyRouteOptions
