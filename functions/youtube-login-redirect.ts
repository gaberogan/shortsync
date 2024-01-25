import type { EventContext } from '@cloudflare/workers-types'

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

interface YouTubeClientConfig {
  web: {
    client_id: string
    project_id: string
    auth_uri: string
    token_uri: string
    auth_provider_x509_cert_url: string
    client_secret: string
    redirect_uris: string[]
    javascript_origins: string[]
  }
}
