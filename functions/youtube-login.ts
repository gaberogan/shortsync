import { getAuthConfig } from '../src/services/Youtube'

// This follows YouTube's official OAuth 2.0 guide
// See https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps

export async function onRequest() {
  // Get login URL
  const loginUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  loginUrl.searchParams.set('client_id', getAuthConfig().web.client_id)
  loginUrl.searchParams.set('redirect_uri', 'https://dev.shortsync.app/youtube-login-redirect')
  loginUrl.searchParams.set('response_type', 'code')
  loginUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.upload')
  loginUrl.searchParams.set('access_type', 'offline')
  loginUrl.searchParams.set('state', encodeURIComponent(JSON.stringify({})))
  loginUrl.searchParams.set('include_granted_scopes', 'true')

  // Redirect to login URL
  return Response.redirect(loginUrl, 302)
}
