// Based on https://github.com/kriasoft/web-auth-library/issues/17

import { assert } from '@common/services/assert'
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

export const getGoogleConfig = () => {
  let config: GoogleClientConfig

  try {
    config = JSON.parse(process.env.GOOGLE_CLIENT_SECRET_JSON)
  } catch (e) {
    throw new Error('GOOGLE_CLIENT_SECRET_JSON is not defined')
  }

  return config
}

/**
 * Based on https://www.npmjs.com/package/web-auth-library?activeTab=code
 * Made to check per Google's recommendations: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
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

const inFlight = new Map()
const cache = new Map()

/**
 * Imports a public key for the provided Google Cloud (GCP) service account credentials.
 *
 * @throws {FetchError} - If the X.509 certificate could not be fetched.
 */
export async function importPublicKey(options: any = {}) {
  const keyId = options.keyId
  const certificateURL = options.certificateURL ?? "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"; // prettier-ignore
  const cacheKey = `${certificateURL}?key=${keyId}`
  const value = cache.get(cacheKey)
  const now = Date.now()
  async function fetchKey() {
    // Fetch the public key from Google's servers
    const res = await fetch(certificateURL)
    if (!res.ok) {
      const error = await res
        .json()
        .then((data) => data.error.message)
        .catch(() => undefined)
      throw new Error('Failed to fetch the public key')
    }
    const data = await res.json()
    const x509 = data[keyId]
    if (!x509) {
      throw new Error(`Public key "${keyId}" not found.`)
    }
    const key = await importX509(x509, 'RS256')
    // Resolve the expiration time of the key
    const maxAge = res.headers.get("cache-control")?.match(/max-age=(\d+)/)?.[1]; // prettier-ignore
    const expires = Date.now() + Number(maxAge ?? '3600') * 1000
    // Update the local cache
    cache.set(cacheKey, { key, expires })
    inFlight.delete(keyId)
    return key
  }
  // Attempt to read the key from the local cache
  if (value) {
    if (value.expires > now + 10_000) {
      // If the key is about to expire, start a new request in the background
      if (value.expires - now < 600_000) {
        const promise = fetchKey()
        inFlight.set(cacheKey, promise)
        if (options.waitUntil) {
          options.waitUntil(promise)
        }
      }
      return value.key
    } else {
      cache.delete(cacheKey)
    }
  }
  // Check if there is an in-flight request for the same key ID
  let promise = inFlight.get(cacheKey)
  // If not, start a new request
  if (!promise) {
    promise = fetchKey()
    inFlight.set(cacheKey, promise)
  }
  return await promise
}
