export type User = {
  id: string
  /** Google user id */
  google_id: string
  email: string
  image: string
  first_name: string
  last_name: string
  /** e.g. en */
  locale: string
  /** Only exists if manually joined */
  channels?: Channel[]
}

export type Channel = {
  id: string
  /** Use email as foreign key since we are using Google's JWT */
  email: string
  /** e.g. youtube,tiktok */
  platform: string
  /** e.g. TechLinked */
  name: string
  image: string
  /** Data required for upload or download e.g. refreshToken */
  data: string
}

export type ChannelData = {
  id: string
  handle: string
  refreshToken: string
}
