import { Channel } from '@common/types/DB'
import { fetchJSON } from '@common/services/Fetch'
import { selectOneQuery } from './DB'
import { getGoogleConfig } from './Google'
import { fetchEmbedding } from './OpenAI'
import categoryEmbeddings from '@api/data/category-embeddings.json'
import { squaredEuclidean } from 'ml-distance-euclidean'

export type YoutubeErrorResponse = {
  error: string
  error_description: string
}

export type YoutubeTokenResponse =
  | {
      access_token: string
      expires_in: number
      token_type: string
      scope: string
      refresh_token: string
    }
  | YoutubeErrorResponse

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

  const response = (await fetchJSON(tokenUrl, fetchOptions)) as YoutubeTokenResponse

  if ('error' in response) {
    throw new Error(`${response.error} - ${response.error_description}`)
  }

  return response
}

export type YoutubeTokenRefreshResponse =
  | {
      access_token: string
      expires_in: number
      token_type: string
      scope: string
    }
  | YoutubeErrorResponse

/**
 * Refresh the user's access token
 */
export const getYoutubeAccessToken = async (email: string) => {
  // Get Youtube channel refresh token

  const channel = await selectOneQuery<Channel>({
    table: 'channel',
    where: { email, platform: 'youtube' },
  }).first()

  if (!channel) {
    throw new Error('YouTube channel not found')
  }

  const { refreshToken } = JSON.parse(channel.data)

  // Get new access token

  const config = getGoogleConfig()

  const tokenUrl = new URL('https://oauth2.googleapis.com/token')

  const formData = new FormData()
  formData.append('client_id', config.web.client_id)
  formData.append('client_secret', config.web.client_secret)
  formData.append('grant_type', 'refresh_token')
  formData.append('refresh_token', refreshToken)

  const fetchOptions = { method: 'POST', body: formData }

  const response: YoutubeTokenRefreshResponse = await fetchJSON(tokenUrl, fetchOptions)

  if ('error' in response) {
    throw new Error(`${response.error} - ${response.error_description}`)
  }

  return response.access_token
}

type YoutubeRevokeResponse = {} | YoutubeErrorResponse

export const revokeYoutubeAccess = (refreshToken: string): Promise<YoutubeRevokeResponse> => {
  return fetchJSON(`https://accounts.google.com/o/oauth2/revoke?token=${refreshToken}`)
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

/**
 * Predicts the Youtube category for any given phrase
 * $1.00 for about 16 million requests
 */
export const predictYoutubeCategory = async (phrase: string) => {
  const phraseEmbedding = await fetchEmbedding(phrase)

  // Find nearest category embedding using KNN
  const categories = categoryEmbeddings
    .map(({ id, category, embedding }) => ({
      id,
      category,
      distance: squaredEuclidean(embedding, phraseEmbedding),
    }))
    .sort((a, b) => a.distance - b.distance)

  return categories[0]
}
