import { fetchJSON } from '../services/Fetch'
import { getGoogleConfig } from './Google'

export interface YouTubeTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  refresh_token: string
  error?: string
  error_description?: string
}

export interface YouTubeTokenRefreshResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
}

export const getRefreshToken = async (authorizationCode: string) => {
  const config = getGoogleConfig()

  const tokenUrl = new URL('https://oauth2.googleapis.com/token')

  const formData = new FormData()
  formData.append('client_id', config.web.client_id)
  formData.append('client_secret', config.web.client_secret)
  formData.append('code', authorizationCode)
  formData.append('grant_type', 'authorization_code')
  // Undocumented fix for redirect_uri: https://stackoverflow.com/a/72365385
  formData.append('redirect_uri', 'postmessage')

  const fetchOptions = { method: 'POST', body: formData }

  const response = (await fetchJSON(tokenUrl, fetchOptions)) as YouTubeTokenResponse

  if (response.error) {
    throw new Error(`${response.error} - ${response.error_description}`)
  }

  return response.refresh_token
}

export const refreshAccessToken = async (refreshToken: string) => {
  const config = getGoogleConfig()

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
