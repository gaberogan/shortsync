import { Show } from 'solid-js'
import { user } from '../services/User'

export default function Home() {
  const me = user()

  return (
    <div>
      <div>Home</div>
      <Show when={me}>Logged in as {me!.email}</Show>
      <Show when={!me}>Not logged in</Show>
    </div>
  )
}
