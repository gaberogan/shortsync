import { onMount } from 'solid-js'
import { loadScript, loadInlineCss } from './Html'
import { decodeJwt } from 'jose'
import { User } from '@common/types/DB'
import { fetchJSON } from '@common/services/Fetch'
import { user, setSessionExpiresAt, setUser } from './User'

// TODO add delete account endpoint
// TODO add ability to log out
// TODO sometimes blank screen on login via custom domain

// Google OneTap bug, color scheme must be light
loadInlineCss(`body > #credential_picker_container { color-scheme: light }`)

export const googleScriptLoaded = loadScript('https://accounts.google.com/gsi/client')

// Load the Google Sign In library
const googleAuthInitialized = googleScriptLoaded.then(() => {
  // Initialize the script
  google.accounts.id.initialize({
    client_id: '246222106209-qsh9tk43lr0do4k8eppfc5dfc9nldhj2.apps.googleusercontent.com',
    context: 'use',
    ux_mode: 'popup',
    cancel_on_tap_outside: false,
    itp_support: true,
    use_fedcm_for_prompt: true,
    login_hint: localStorage.getItem('loginHint') || undefined,
    auto_select: true,
    callback: async ({ credential }) => {
      // Login with HTTP-only Cookie
      const newUser: User = await fetchJSON(`/google-login?token=${credential}`, { method: 'POST' })

      // Set the user + session expiration
      setUser(newUser)
      setSessionExpiresAt(decodeJwt(credential).exp! * 1000)

      // Set login hint for next time
      localStorage.setItem('loginHint', newUser.email)
    },
  })

  // Display the One Tap dialog
  if (!user()) {
    google.accounts.id.prompt()
  }
})

interface GoogleSignInOptions {
  width?: number
}

// Render a Google Sign In button
export const renderGoogleSignIn = async (el: HTMLElement, options: GoogleSignInOptions) => {
  await googleAuthInitialized
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
