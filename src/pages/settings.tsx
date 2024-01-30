import { Show } from 'solid-js'
import { GoogleSignInButton } from '../services/Google'
import { user } from '../services/User'
import { YoutubeAuthButton } from '../services/Youtube'

export default function Settings() {
  const me = user()

  return (
    <div>
      <div>Settings</div>
      <Show when={me}>Logged in as {me!.email}</Show>
      <Show when={!me}>Not logged in</Show>
      <GoogleSignInButton width={300} />
      <YoutubeAuthButton />
    </div>
  )
}
