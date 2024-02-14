import { fetchJSON } from '@common/services/Fetch'

type EmbeddingResponse = {
  data: {
    embedding: number[]
  }[]
}

/**
 * Fetch an embedding for a phrase from OpenAI using text-embedding-3-small ($0.00002 / 1K tokens)
 */
export const fetchEmbedding = async (phrase: string) => {
  const res: EmbeddingResponse = await fetchJSON('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: phrase,
      model: 'text-embedding-3-small',
      encoding_format: 'float',
    }),
  })

  return res.data[0].embedding
}
