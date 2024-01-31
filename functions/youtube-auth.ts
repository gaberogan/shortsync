import { getYoutubeChannel, getYoutubeTokens } from '../src/backend/Youtube'
import { auth } from '../src/backend/WorkerUtils'
import { insertOrReplaceQuery } from '../src/backend/DB'
import { Channel, ChannelData } from '../src/types/DB'
import { uuid } from '@cfworker/uuid'
import { fetchUserWithChannelsRedacted } from '../src/backend/User'

export const onRequestPost = auth(async (ctx, jwt) => {
  const url = new URL(ctx.request.url)
  const code = url.searchParams.get('code')!

  const { refresh_token, access_token } = await getYoutubeTokens(code)

  const youtubeChannel = await getYoutubeChannel(access_token)

  // Add the channel
  await insertOrReplaceQuery<Channel>(
    {
      id: uuid(),
      email: jwt.email as string,
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
  const user = await fetchUserWithChannelsRedacted(jwt.email as string)
  return new Response(JSON.stringify(user))
})
