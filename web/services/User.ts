import { User } from '@common/types/DB'
import LocalStorage from './LocalStorage'
import { createGlobalSignal, createStoredGlobalSignal } from './Solid'

// TODO when signed out, refresh the page. if page is for signed in users only then show a full page modal with a sign in button

// Global user state
const [_user, _setUser] = createStoredGlobalSignal<User | null>('user')
export const user = () => {
  const me = _user()
  return sessionExpired() ? null : me
}
export const setUser = _setUser
export const mergeUser = (newUser: Partial<User>) => setUser({ ..._user()!, ...newUser })

// Is the session expired, grace period expires session 1 minute sooner
const isSessionExpiredNow = ({ gracePeriodMs }: { gracePeriodMs?: number } = {}) => {
  gracePeriodMs ??= 1 * 60 * 1000
  const sessionExpiresAt = Number(LocalStorage.get('sessionExpiresAtMs'))
  const expired = sessionExpiresAt - gracePeriodMs < Date.now()
  return expired
}

// Session expiration reactive state, refresh every 10 seconds
const [sessionExpired, setSessionExpired] = createGlobalSignal(isSessionExpiredNow())
setInterval(() => setSessionExpired(isSessionExpiredNow()), 10000)
export const setSessionExpiresAt = (ms: number) => {
  LocalStorage.set('sessionExpiresAtMs', ms)
  setSessionExpired(isSessionExpiredNow())
}
