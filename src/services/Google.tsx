import { onMount } from 'solid-js'
import { loadScript, loadInlineCss } from './Html'

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
      const user = await fetch(`/google-signup?token=${credential}`).then((x) => x.text())
      // TODO store the credential
    },
    cancel_on_tap_outside: false,
    itp_support: true,
    use_fedcm_for_prompt: true,
  })

  // Display the One Tap dialog
  google.accounts.id.prompt()
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
