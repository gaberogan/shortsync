import { scrapeTikTokUrl } from '@/backend/TikTok'
import { auth } from '../src/backend/WorkerUtils'
import { getYoutubeAccessToken } from '@/backend/Youtube'
import { fetchHeadAndAbort } from '@/services/Fetch'

// Upload follows these guides
// https://developers.google.com/youtube/v3/docs/videos/insert
// https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol
// TODO implement full spec

export const onRequestPost = auth(async (ctx, jwt) => {
  // Get new access token
  const accessToken = await getYoutubeAccessToken(jwt.email as string)

  // Scrape TikTok
  const videoData = await scrapeTikTokUrl('https://www.tiktok.com/@tyler.oliveira/video/7327379852019911978')
  const videoUrl = videoData.video.playAddr
  const title = videoData.desc
  const country = videoData.locationCreated
  const id = videoData.id
  const categories = videoData.diversificationLabels // must transform for youtube
  const tags = videoData.suggestedWords
  const headers = videoData.headers
  const duration = videoData.video.duration
  // and a BUNCH of other stuff

  if (duration > 60) {
    throw new Error('Video must be 60 seconds or less')
  }

  // Download the video headers from TikTok
  const videoResponse = await fetchHeadAndAbort(videoUrl, { headers })
  const contentLength = videoResponse.headers.get('Content-Length')!
  const contentType = videoResponse.headers.get('Content-Type')!

  // TODO make sure it counts as a Short

  // Request the upload URL
  const requestUploadUrl =
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails' // allow user to set notifySubscribers
  const requestUploadResponse = await fetch(requestUploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // 'Content-Length': 'Set automatically by Fetch API',
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Length': contentLength,
      'X-Upload-Content-Type': 'video/*', // hopefully read the docs right
    },
    body: JSON.stringify({
      snippet: {
        title: title + ' #shorts',
        categoryId: '22', // required // GET https://youtube.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=us Authorization: Bearer [YOUR_ACCESS_TOKEN]
        description: '#shorts',
        tags,
      },
      status: {
        privacyStatus: 'private',
      },
      // TODO allow JSON level customization via validated templates
    }),
  })
  const uploadUrl = requestUploadResponse.headers.get('Location')!

  // Download/Upload the video
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Length': contentLength,
      'Content-Type': contentType,
    },
    body: (await fetch(videoUrl, { headers })).body,
  })

  return uploadResponse
})
