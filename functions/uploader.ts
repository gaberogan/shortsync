import { fetchJSON } from '@/services/Fetch'
import { auth } from '../src/backend/WorkerUtils'

export const onRequestPost = auth(async (ctx, jwt) => {
  const videoUrl = 'https://pub-062aaf7b73f6408c8b3c084f3141c880.r2.dev/test_video.mp4'
  const videoResponse = await fetch(videoUrl)

  const uploadUrl = 'https://www.googleapis.com/upload/youtube/v3/videos'
  const uploadResponse = await fetchJSON(uploadUrl, {
    method: 'POST',
    body: videoResponse.body,
  })

  console.log(uploadResponse)

  return new Response(JSON.stringify(uploadResponse))
})
