import { unauth } from '../backend/WorkerUtils'

export const onRequest = unauth(async () => {
  return new Response('test')
})
