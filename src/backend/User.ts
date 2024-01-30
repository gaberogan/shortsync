import { User } from '../types/DB'

export const redactUser = (user: User): User => {
  // Not strictly necessary but helps to not expose refresh token to frontend
  if (user.youtube_refresh_token) {
    user.youtube_refresh_token = 'redacted'
  }

  return user
}
