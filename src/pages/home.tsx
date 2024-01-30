import { Show } from 'solid-js'
import { user } from '../services/User'

export default function Home() {
  return (
    <div>
      <div>Home</div>
      <Show when={user()}>Logged in as {user()!.email}</Show>
      <Show when={!user()}>Not logged in</Show>
    </div>
  )
}
