// Based on https://github.com/kriasoft/web-auth-library/issues/17

import { assert } from '../shared/assert'
import { decodeProtectedHeader, jwtVerify, importX509 } from 'jose'

export interface GoogleClientConfig {
  web: {
    client_id: string
    project_id: string
    auth_uri: string
    token_uri: string
    auth_provider_x509_cert_url: string
    client_secret: string
    redirect_uris: string[]
    javascript_origins: string[]
  }
}

export const getClientConfig = () => {
  let config: GoogleClientConfig

  try {
    config = JSON.parse(env.GOOGLE_CLIENT_SECRET_JSON)
  } catch (e) {
    throw new Error('env.GOOGLE_CLIENT_SECRET_JSON is not defined')
  }

  return config
}

/**
 * Based on https://www.npmjs.com/package/web-auth-library?activeTab=code
 * Made to check per Google's recommendations: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
 * TODO use a cache to save 25ms per request
 */
export const verifyIdToken = async (options: any = {}) => {
  const { idToken, clientId } = options

  assert(idToken, 'Missing "idToken"')
  assert(clientId, 'Missing "clientId"')

  // Import the public key from the Google Cloud project
  const header = decodeProtectedHeader(idToken)
  const now = Math.floor(Date.now() / 1000)

  const key = await importPublicKey({
    keyId: header.kid,
    certificateURL: 'https://www.googleapis.com/oauth2/v1/certs',
  })

  const { payload } = await jwtVerify(idToken, key, {
    audience: clientId,
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    maxTokenAge: '1h',
    clockTolerance: '5m',
  })

  if (!payload.sub) {
    throw new Error(`Missing "sub" claim`)
  }

  if (typeof payload.auth_time === 'number' && payload.auth_time > now) {
    throw new Error(`Unexpected "auth_time" claim value`)
  }

  return payload
}

/**
 * Imports a public key for the provided Google Cloud (GCP) service account credentials.
 * @throws {FetchError} - If the X.509 certificate could not be fetched.
 */
const importPublicKey = async (options: any = {}) => {
  const { keyId, certificateURL } = options

  assert(keyId, 'Missing "keyId"')
  assert(certificateURL, 'Missing "certificateURL"')

  // Fetch the public key from Google's servers
  const res = await fetch(certificateURL)

  // Catch errors
  if (!res.ok) {
    const error = await res
      .json()
      .then((data: any) => data.error.message)
      .catch(() => undefined)
    throw new Error(error ?? "Failed to fetch Google's public key")
  }

  const data: any = await res.json()
  const x509 = data[keyId]
  if (!x509) {
    throw new Error(`Public key "${keyId}" not found.`)
  }

  const key = await importX509(x509, 'RS256')
  return key
}
