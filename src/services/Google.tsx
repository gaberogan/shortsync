import { onMount } from 'solid-js'
import { loadScript, loadInlineCss } from './html'
import { decodeJwt } from 'jose'
import { createGlobalSignal } from './solid'
import { User } from '../types/DB'
import { fetchJSON } from './fetch'

// Detect if the user is logged in
const isAuthenticated = ({ gracePeriodMs }: { gracePeriodMs?: number } = {}) => {
  gracePeriodMs ??= 10 * 1000
  const sessionExpiresAt = Number(localStorage.getItem('sessionExpiresAtMs'))
  return sessionExpiresAt - gracePeriodMs < Date.now()
}

// Global login state
const [_loggedIn, _setLoggedIn] = createGlobalSignal(isAuthenticated())
export const loggedIn = _loggedIn

// Refresh login state
const refreshLoginState = () => _setLoggedIn(isAuthenticated())
setInterval(refreshLoginState, 5000)

// Google Authentication

// Google OneTap bug, color scheme must be light
loadInlineCss(`body > #credential_picker_container { color-scheme: light }`)

// Load the Google Sign In library
const initialized = loadScript('https://accounts.google.com/gsi/client').then(() => {
  // Initialize the script
  google.accounts.id.initialize({
    client_id: '246222106209-qsh9tk43lr0do4k8eppfc5dfc9nldhj2.apps.googleusercontent.com',
    context: 'use',
    ux_mode: 'popup',
    callback: async ({ credential }) => {
      // Login with HTTP-only Cookie
      const user: User = await fetchJSON(`/google-login?token=${credential}`)

      // Refresh login state
      localStorage.setItem('sessionExpiresAtMs', String(decodeJwt(credential).exp! * 1000))
      refreshLoginState()

      // Set login hint for next time
      localStorage.setItem('loginHint', user.email)
    },
    cancel_on_tap_outside: false,
    itp_support: true,
    use_fedcm_for_prompt: true,
    login_hint: localStorage.getItem('loginHint') || undefined,
  })

  // Display the One Tap dialog
  if (!isAuthenticated()) {
    google.accounts.id.prompt()
  }
})

interface GoogleSignInOptions {
  width?: number
}

// Render a Google Sign In button
export const renderGoogleSignIn = async (el: HTMLElement, options: GoogleSignInOptions) => {
  await initialized
  google.accounts.id.renderButton(el, {
    type: 'standard',
    shape: 'rectangular',
    theme: 'outline',
    text: 'continue_with',
    size: 'large',
    logo_alignment: 'left',
    width: 400,
    ...options,
  })
}

export const GoogleSignInButton = (props: GoogleSignInOptions) => {
  let googleSignInEl: HTMLDivElement | undefined

  onMount(() => {
    renderGoogleSignIn(googleSignInEl!, props)
  })

  return (
    // Google Sign In bug, color scheme must be light
    <div style="color-scheme: light" ref={googleSignInEl!} />
  )
}
