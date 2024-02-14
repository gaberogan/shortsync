import { parse } from 'cookie'
import { getGoogleConfig, verifyIdToken } from './Google'
import { JWTPayload } from 'jose'
import { FastifyRequest } from 'fastify'
import { FastifyError } from './Fastify'

/**
 * Create an authenticated endpoint
 * @example fastify.route({ preHandler: [auth] })
 */
export const auth = async (request: FastifyRequest) => {
  const token = parse((request.headers.Cookie as string) || '')['token']

  if (!token) {
    throw new FastifyError('Not logged in', 401)
  }

  const payload = await verifyIdToken({
    idToken: token,
    clientId: getGoogleConfig().web.client_id,
  })

  request.user = payload
}

// Add user to fastify Request
declare module 'fastify' {
  export interface FastifyRequest {
    user?: JWTPayload
  }
}
