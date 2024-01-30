import { css } from '@emotion/css'
import { fetchJSON } from './Fetch'
import { googleScriptLoaded } from './Google'
import { setUser, user } from './User'
import { User } from '../types/DB'

// TODO add disconnect YouTube endpoint

const requestYoutubeAuth = async () => {
  await googleScriptLoaded
  const youtubeClient = google.accounts.oauth2.initCodeClient({
    client_id: '246222106209-qsh9tk43lr0do4k8eppfc5dfc9nldhj2.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/youtube.upload',
    ux_mode: 'popup',
    login_hint: localStorage.getItem('loginHint') || undefined,
    callback: async (authResponse) => {
      if (authResponse.error) {
        throw new Error(JSON.stringify(authResponse, null, 2))
      }

      // TODO error toast if failed

      const user: User = await fetchJSON(`/youtube-auth?code=${authResponse.code}`, {
        method: 'POST',
      })

      // Update user with youtube_refresh_token: 'redacted'
      setUser(user)
    },
  })

  youtubeClient.requestCode()
}

export const YoutubeAuthButton = () => {
  const me = user()
  const connected = me?.youtube_refresh_token

  if (connected) {
    return <div class={style}>YouTube Connected as {me!.email}</div>
  }

  return (
    <div class={style} onClick={requestYoutubeAuth}>
      Connect YouTube
    </div>
  )
}

const style = css`
  background: white;
  color: black;
  padding: 8px 12px;
  width: 250px;
  border-radius: 4px;
  cursor: pointer;
  :active {
    opacity: 0.95;
  }
`