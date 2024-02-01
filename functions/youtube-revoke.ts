import { auth } from '../src/backend/WorkerUtils'
import { deleteQuery, selectOneQuery } from '../src/backend/DB'
import { Channel, ChannelData } from '../src/types/DB'
import { fetchUserWithChannelsRedacted } from '../src/backend/User'
import { revokeYoutubeAccess } from '@/backend/Youtube'

export const onRequestGet = auth(async (ctx, jwt) => {
  const channel = await selectOneQuery<Channel>({
    table: 'channel',
    where: { email: jwt.email as string, platform: 'youtube' },
  }).first()

  if (!channel) {
    throw new Error('YouTube channel not found')
  }

  const { refreshToken } = JSON.parse(channel!.data) as ChannelData

  const revokeResponse = await revokeYoutubeAccess(refreshToken)

  // It might have already been revoked by the user, don't throw
  if ('error' in revokeResponse) {
    console.error(`${revokeResponse.error} - ${revokeResponse.error_description}`)
  }

  // Delete the channel
  await deleteQuery<Channel>({ table: 'channel', where: { email: jwt.email as string, platform: 'youtube' } }).run()

  // Return user
  const user = await fetchUserWithChannelsRedacted(jwt.email as string)
  return new Response(JSON.stringify(user))
})
