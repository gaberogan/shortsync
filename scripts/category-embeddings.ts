// Run with npx tsx scripts/category-embeddings.ts
import 'dotenv/config'
import { fetchJSON } from '@common/services/Fetch'
import { fetchEmbedding } from '@api/services/OpenAI'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Inject environment into env variable

// @ts-ignore
globalThis.env = process.env

// Types

type YoutubeCategoriesResponse = {
  items: {
    id: string
    snippet: {
      title: string
    }
  }[]
}

// Fetch youtube categories

const youtubeCategories: YoutubeCategoriesResponse = await fetchJSON(
  `https://youtube.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=US&key=${env.YOUTUBE_API_KEY}`,
  {
    headers: {
      Accept: 'application/json',
    },
  }
)

// Format youtube categories

const categories = youtubeCategories.items.map((c) => ({
  id: Number(c.id),
  category: c.snippet.title,
}))

// Get embeddings from OpenAI

const embeddings = await Promise.all(
  categories.map(async ({ id, category }) => ({
    id,
    category,
    embedding: await fetchEmbedding(category),
  }))
)

// Write embeddings to a file

const dataFolder = path.join(__dirname, '../data/category-embeddings.json')
fs.writeFileSync(dataFolder, JSON.stringify(embeddings))
