import { EventContext } from '@cloudflare/workers-types'
import { getRefreshToken } from '../src/backend/Youtube'

// This follows YouTube's official OAuth 2.0 guide
// See https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps

export async function onRequest(ctx: EventContext<any, any, any>) {
  // @ts-ignore Make env a global variable
  globalThis.env = ctx.env

  const url = new URL(ctx.request.url)
  const error = url.searchParams.get('error')
  const code = url.searchParams.get('code')

  // Authentication failed
  if (error || !code) {
    // TODO report the error?
    return new Response(`Failed to login, error: ${error}`)
  }

  // Exchange the authorization code for a refresh token
  const refreshToken = await getRefreshToken(code)

  // TODO need accounts for user ID
  // TODO store refreshToken in D1
  // const { result } = await env.DB.prepare("SELECT key").all() // or first
  // await env.DB.prepare("UPDATE key=?").bind(value).all() // or run

  return Response.redirect(url.origin + '/settings', 302)
}
