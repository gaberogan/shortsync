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

/**
 * Exchange the authorization code for a refresh token
 * See https://developers.google.com/identity/oauth2/web/guides/use-code-model
 */
export const getYoutubeTokens = async (authorizationCode: string) => {
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

  return response
}

/**
 * Refresh the user's access token
 */
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

type YoutubeChannelResponse = {
  items: {
    id: string
    snippet: {
      /** e.g. My Channel */
      title: string
      /** e.g. '@handle' */
      customUrl: string
      thumbnails: {
        /** 88px */
        default: { url: string }
        /** 240px */
        medium: { url: string }
        /** 800px */
        high: { url: string }
      }
    }
  }[]
}

/**
 * Get the user's youtube channel details
 * See https://developers.google.com/youtube/v3/docs/channels/list
 */
export const getYoutubeChannel = async (accessToken: string) => {
  const res: YoutubeChannelResponse = await fetchJSON(
    'https://youtube.googleapis.com/youtube/v3/channels?part=snippet&part=id&maxResults=1&mine=true',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  )

  return res.items[0]
}
