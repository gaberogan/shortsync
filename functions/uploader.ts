import type { EventContext } from '@cloudflare/workers-types'

export async function onRequest(ctx: EventContext<any, any, any>) {
  // @ts-ignore Make env a global variable
  globalThis.env = ctx.env

  // TODO handle invalid token or other errors
  return new Response('hello uploader')
}
