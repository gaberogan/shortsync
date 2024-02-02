import { predictYoutubeCategory } from '../backend/Youtube'

// @ts-ignore
globalThis.env = process.env

const category = await predictYoutubeCategory('coca cola')
console.log(category)
