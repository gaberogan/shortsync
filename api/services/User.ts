import { Channel, User } from '@common/types/DB'
import { selectManyQuery, selectOneQuery } from './DB'

export const fetchRedactedUser = async (email: string) => {
  // prettier-ignore
  const [{ results: [user] }, { results: channels }] = await process.env.DB.batch(
    selectOneQuery<User>({ table: 'user', where: { email: email } }),
    selectManyQuery<Channel>({ table: 'channel', where: { email: email } })
  )

  // Not necessary but good to avoid exposing refreshToken to frontend
  channels.forEach((c) => (c.data = 'redacted'))

  user.channels = channels

  return user
}
