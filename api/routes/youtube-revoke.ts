import { auth } from '@api/services/Auth'
import { deleteQuery, selectOneQuery } from '@api/services/DB'
import { Channel, ChannelData } from '@common/types/DB'
import { fetchRedactedUser } from '@api/services/User'
import { revokeYoutubeAccess } from '@api/services/Youtube'

export default {
  method: 'GET',
  url: '/youtube-revoke',
  schema: {},
  preHandler: [auth],
  handler: async (request, reply) => {
    const channel = await selectOneQuery<Channel>({
      table: 'channel',
      where: { email: request.user!.email as string, platform: 'youtube' },
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
    await deleteQuery<Channel>({
      table: 'channel',
      where: { email: request.user!.email as string, platform: 'youtube' },
    }).run()

    // Return user
    const user = await fetchRedactedUser(request.user!.email as string)
    return new Response(JSON.stringify(user))
  },
} as FastifyRouteOptions
