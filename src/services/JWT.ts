import { jwtVerify, SignJWT } from 'jose'

/**
 * See https://github.com/panva/jose/blob/main/docs/classes/jwt_sign.SignJWT.md
 */
export const signJWT = async () => {
  const secret = new TextEncoder().encode(env.JWT_SECRET)
  const alg = 'HS256'

  const jwt = await new SignJWT({ foo: 'bar' })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(env.ORIGIN)
    .setExpirationTime('2h')
    .sign(secret)

  return jwt
}

/**
 * See https://github.com/panva/jose/blob/main/docs/functions/jwt_verify.jwtVerify.md
 */
export const verifyJWT = async (jwt: string) => {
  const secret = new TextEncoder().encode(env.JWT_SECRET)

  const { payload } = await jwtVerify(jwt, secret, { issuer: env.ORIGIN })

  return payload
}
