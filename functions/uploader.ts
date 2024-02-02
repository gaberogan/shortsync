import { scrapeTikTokUrl } from 'backend/TikTok'
import { auth } from '../backend/WorkerUtils'
import { getYoutubeAccessToken } from 'backend/Youtube'
import { fetchHeadAndAbort } from '@/services/Fetch'
import { predictYoutubeCategory } from '../backend/Youtube'

// Upload follows these guides
// https://developers.google.com/youtube/v3/docs/videos/insert
// https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol
// TODO implement full specs + validation + allow user to set notifySubscribers

export const onRequestPost = auth(async (ctx, jwt) => {
  // Scrape TikTok
  const videoData = await scrapeTikTokUrl('https://www.tiktok.com/@tyler.oliveira/video/7228632635914997038')
  const videoUrl = videoData.video.playAddr
  const title = videoData.desc
  const categories = videoData.diversificationLabels // must transform for youtube
  const tags = videoData.suggestedWords
  const headers = videoData.headers
  const duration = videoData.video.duration
  // const country = videoData.locationCreated
  // const id = videoData.id
  // and a BUNCH of other stuff

  if (duration > 60) {
    throw new Error('Video must be 60 seconds or less')
  }

  // Download the video headers from TikTok
  const videoResponse = await fetchHeadAndAbort(videoUrl, { headers })
  const contentLength = videoResponse.headers.get('Content-Length')!
  const contentType = videoResponse.headers.get('Content-Type')!

  // Get category using OpenAI
  const categoryId = (await predictYoutubeCategory(`${title} ${categories.join(' ')}`)).id

  // Get new access token
  const accessToken = await getYoutubeAccessToken(jwt.email as string)

  // TODO why is categoryId 22 working but 21 broken
  // console.log(JSON.stringify({ categoryId }))

  // Submit video metadta + request upload URL
  const requestUploadResponse = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Content-Length is set automatically by Fetch API
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Length': contentLength,
        'X-Upload-Content-Type': 'video/*',
      },
      body: JSON.stringify({
        snippet: {
          title: title + ' #shorts',
          categoryId: 22,
          description: '#shorts',
          tags,
        },
        status: {
          privacyStatus: 'private',
        },
        // TODO allow JSON level customization via validated templates
      }),
    }
  )

  // Error with auth or validation
  if (requestUploadResponse.status !== 200) {
    throw new Error(await requestUploadResponse.text())
  }

  // Get the upload URL
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
