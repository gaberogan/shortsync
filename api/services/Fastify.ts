import fs from 'fs'
import path from 'path'
import type fastify from 'fastify'

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
    const route = await import(filePath)
    app.register(route)
  }
}
