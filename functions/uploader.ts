import type { EventContext } from '@cloudflare/workers-types'

export async function onRequest(ctx: EventContext<any, any, any>) {
  return new Response('hello uploader')
}
