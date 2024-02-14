// Run with npx tsx scripts/debug-embeddings.ts
import 'dotenv/config'
import { predictYoutubeCategory } from '@api/services/Youtube'

// @ts-ignore
globalThis.env = process.env

const category = await predictYoutubeCategory('coca cola')
console.log(category)
