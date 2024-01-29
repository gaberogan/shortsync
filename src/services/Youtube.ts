export interface YouTubeClientConfig {
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

export interface YouTubeTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  refresh_token: string
}

export interface YouTubeTokenRefreshResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
}

export const getAuthConfig = () => {
  let config: YouTubeClientConfig

  try {
    config = JSON.parse(env.YOUTUBE_CLIENT_SECRET_JSON)
  } catch (e) {
    throw new Error('env.YOUTUBE_CLIENT_SECRET_JSON is not defined')
  }

  return config
}

export const getRefreshToken = async (authorizationCode: string) => {
  const config = getAuthConfig()

  const tokenUrl = new URL('https://oauth2.googleapis.com/token')

  const formData = new FormData()
  formData.append('client_id', config.web.client_id)
  formData.append('client_secret', config.web.client_secret)
  formData.append('code', authorizationCode)
  formData.append('grant_type', 'authorization_code')
  // TODO Looks like this redirect_uri isn't even used?
  // formData.append('redirect_uri', 'https://shortsync.app/youtube-login-redirect') // use url.href?

  const fetchOptions = { method: 'POST', body: formData }

  const response = (await fetch(tokenUrl, fetchOptions).then((x) => x.json())) as YouTubeTokenResponse

  // TODO how to handle errors?

  return response.refresh_token
}

export const refreshAccessToken = async (refreshToken: string) => {
  const config = getAuthConfig()

  const tokenUrl = new URL('https://oauth2.googleapis.com/token')

  const formData = new FormData()
  formData.append('client_id', config.web.client_id)
  formData.append('client_secret', config.web.client_secret)
  formData.append('grant_type', 'authorization_code')
  formData.append('refresh_token', refreshToken)

  const fetchOptions = { method: 'POST', body: formData }

  const response = (await fetch(tokenUrl, fetchOptions).then((x) => x.json())) as YouTubeTokenRefreshResponse

  // TODO how to handle errors?

  return response.access_token
}
