import { auth } from '../src/backend/WorkerUtils'

export const onRequest = auth(async (ctx, jwt) => {
  return new Response(JSON.stringify(jwt, null, 2))
})
