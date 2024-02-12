import { css } from '@emotion/css'
import { fetchJSON } from '@common/services/Fetch'
import { googleScriptLoaded } from './Google'
import { setUser, user } from './User'
import { User } from '@common/types/DB'
import { Show } from 'solid-js'

const requestYoutubeAuth = async () => {
  await googleScriptLoaded
  const youtubeClient = google.accounts.oauth2.initCodeClient({
    client_id: '246222106209-qsh9tk43lr0do4k8eppfc5dfc9nldhj2.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/youtube',
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

      // Update user channels
      setUser(user)
    },
  })

  youtubeClient.requestCode()
}

export const revokeYoutubeAuth = async () => {
  const user: User = await fetchJSON('/youtube-revoke')
  setUser(user)
}

export const YoutubeAuthButton = () => {
  const isConnected = () => user()?.channels?.length
  const getYoutubeChannel = () => user()?.channels?.find((c) => c.platform === 'youtube')

  return (
    <>
      <Show when={isConnected()}>
        <div class={buttonStyle}>
          <div>YouTube Connected as</div>
          <img width={20} style="border-radius:20px" src={getYoutubeChannel()!.image} />
          {getYoutubeChannel()!.name}
        </div>
        <div class={buttonStyle} onClick={revokeYoutubeAuth}>
          Disconnect
        </div>
      </Show>
      <Show when={!isConnected()}>
        <div class={buttonStyle} onClick={requestYoutubeAuth}>
          Connect YouTube
        </div>
      </Show>
    </>
  )
}

const buttonStyle = css`
  margin: 8px 0;
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
