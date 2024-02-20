import { getYoutubeChannel, getYoutubeTokens } from '@api/services/Youtube'
import { auth } from '@api/services/Auth'
import { insertOrReplaceQuery } from '@api/services/DB'
import { Channel, ChannelData } from '@common/types/DB'
import { fetchRedactedUser } from '@api/services/User'
import { v4 as uuidv4 } from 'uuid'

export default {
  method: 'POST',
  url: '/youtube-auth',
  schema: {},
  preHandler: [auth],
  handler: async (request, reply) => {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')!

    const { refresh_token, access_token } = await getYoutubeTokens(code)

    const youtubeChannel = await getYoutubeChannel(access_token)

    // Add the channel
    await insertOrReplaceQuery<Channel>(
      {
        id: uuidv4(),
        email: request.user!.email as string,
        platform: 'youtube',
        name: youtubeChannel.snippet.title,
        image: youtubeChannel.snippet.thumbnails.high.url,
        data: JSON.stringify({
          id: youtubeChannel.id,
          handle: youtubeChannel.snippet.customUrl,
          refreshToken: refresh_token,
        } as ChannelData),
      },
      { table: 'channel' }
    ).run()

    // Return user
    const user = await fetchRedactedUser(request.user!.email as string)
    return new Response(JSON.stringify(user))
  },
} as FastifyRouteOptions
