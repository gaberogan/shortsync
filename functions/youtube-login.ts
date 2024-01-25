import type { EventContext } from '@cloudflare/workers-types'
import type { YouTubeClientConfig } from '../src/types/Youtube'

// This follows YouTube's official OAuth 2.0 guide
// See https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps

export async function onRequest(ctx: EventContext<any, any, any>) {
  const clientConfig = JSON.parse(ctx.env.YOUTUBE_CLIENT_SECRET_JSON) as YouTubeClientConfig

  const loginUrl = getLoginUrl(clientConfig.web.client_id)

  return Response.redirect(loginUrl, 302)
}

const getLoginUrl = (clientId: string) => {
  const loginUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  loginUrl.searchParams.set('client_id', clientId)
  loginUrl.searchParams.set('redirect_uri', 'https://dev.shortsync.app/youtube-login-redirect')
  loginUrl.searchParams.set('response_type', 'code')
  loginUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.upload')
  loginUrl.searchParams.set('access_type', 'offline')
  loginUrl.searchParams.set('state', encodeURIComponent(JSON.stringify({})))
  loginUrl.searchParams.set('include_granted_scopes', 'true')
  return loginUrl
}
