import { Show } from 'solid-js'
import { GoogleSignInButton } from '@web/services/Google'
import { user } from '@web/services/User'
import { YoutubeAuthButton } from '@web/services/Youtube'

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
