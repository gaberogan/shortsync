import fs from 'fs'
import path from 'path'
import { FastifyInstance } from 'fastify'
import { assert } from '@common/services/assert'

export const registerRoutes = async (app: FastifyInstance, folder: string) => {
  // Check folder exists
  if (!fs.existsSync(folder)) {
    throw new Error(`${folder} does not exist`)
  }

  // Read all files in folder
  const files = fs.readdirSync(folder)

  // Add routes
  for (const file of files) {
    const filePath = path.join(folder, file)
    const route = (await import(filePath)).default

    assert(route?.url && route?.method && route?.handler, `Route ${file} must export a { url, method, handler }`)

    app.route(route)
  }
}

export class FastifyError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
  }
}
