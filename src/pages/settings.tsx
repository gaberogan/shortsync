import { Show } from 'solid-js'
import { GoogleSignInButton } from '../services/Google'
import { user } from '../services/User'
import { YoutubeAuthButton } from '../services/Youtube'

export default function Settings() {
  return (
    <div>
      <div>Settings</div>
      <Show when={user()}>Logged in as {user()!.email}</Show>
      <Show when={!user()}>Not logged in</Show>
      <GoogleSignInButton width={300} />
      <YoutubeAuthButton />
    </div>
  )
}
