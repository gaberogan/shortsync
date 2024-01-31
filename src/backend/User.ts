import { Channel, User } from '../types/DB'
import { selectManyQuery, selectOneQuery } from './DB'

export const fetchUserWithChannelsRedacted = async (email: string) => {
  // prettier-ignore
  const [{ results: [user] }, { results: channels }] = await env.DB.batch(
    selectOneQuery<User>({ table: 'user', where: { email: email } }),
    selectManyQuery<Channel>({ table: 'channel', where: { email: email } })
  )

  // Not necessary but good to avoid exposing refreshToken to frontend
  channels.forEach((c) => (c.data = 'redacted'))

  user.channels = channels

  return user
}
