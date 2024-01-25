import type { EventContext, Response as TResponse } from '@cloudflare/workers-types'

export async function onRequest(ctx: EventContext<any, any, any>): Promise<TResponse> {
  return new Response('hello world yt') as any
}
