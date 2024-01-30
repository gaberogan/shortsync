import { getRefreshToken } from '../src/backend/Youtube'
import { auth } from '../src/backend/WorkerUtils'
import { User } from '../src/types/DB'
import { redactUser } from '../src/backend/User'

// This follows YouTube's official OAuth 2.0 guide
// See https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps

export const onRequestPost = auth(async (ctx, jwt) => {
  const url = new URL(ctx.request.url)
  const code = url.searchParams.get('code')!

  // Exchange the authorization code for a refresh token
  const refreshToken = await getRefreshToken(code)

  const email = jwt.email as string

  // Add youtube_refresh_token to user and return user
  const [, query2] = await env.DB.batch([
    env.DB.prepare('UPDATE USER SET youtube_refresh_token = ? WHERE email = ?').bind(refreshToken, email),
    env.DB.prepare('SELECT * FROM user WHERE email = ? LIMIT 1').bind(email),
  ])

  const user = redactUser(query2.results[0] as User)

  return new Response(JSON.stringify(user))
})
