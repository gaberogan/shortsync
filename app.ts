import { registerRoutes } from '@api/services/Fastify'
import 'dotenv/config'
import Fastify from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

const main = async () => {
  const fastify = Fastify().withTypeProvider<TypeBoxTypeProvider>()

  await registerRoutes(fastify, './api/routes')

  fastify.listen({ port: 3000 })
}

main()
