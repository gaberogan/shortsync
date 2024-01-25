import type { EventContext } from '@cloudflare/workers-types'
import type { YouTubeClientConfig } from '../src/types/Youtube'

// This follows YouTube's official OAuth 2.0 guide
// See https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps

export function onRequest(ctx: EventContext<any, any, any>) {
  const url = new URL(ctx.request.url)
  const error = url.searchParams.get('error')
  const code = url.searchParams.get('code')

  if (error || !code) {
    return new Response(`Failed to login, error: ${error}`)
  }

  // TODO add to secrets in cloudflare
  const clientConfig = JSON.parse(ctx.env.YOUTUBE_CLIENT_SECRET_JSON) as YouTubeClientConfig

  const tokenUrl = new URL('https://oauth2.googleapis.com/token')
  tokenUrl.searchParams.set('client_id', clientConfig.web.client_id)
  tokenUrl.searchParams.set('client_secret', clientConfig.web.client_secret)
  tokenUrl.searchParams.set('code', code)
  tokenUrl.searchParams.set('grant_type', 'authorization_code')
  tokenUrl.searchParams.set('redirect_uri', ctx.request.url) // TODO wait we have 2 callback urls?

  // TODO store code in KV

  return Response.redirect(url.origin + '/settings', 302)
}
