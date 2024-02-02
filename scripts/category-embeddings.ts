import { fetchJSON } from '@/services/Fetch'
import { fetchEmbedding } from '../backend/OpenAI'
import fs from 'fs'
import path from 'path'

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
  id: c.id,
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
