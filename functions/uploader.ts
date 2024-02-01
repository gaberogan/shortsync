import { auth, getEncodedJwt } from '../src/backend/WorkerUtils'

// TODO implement full spec https://developers.google.com/youtube/v3/docs/videos/insert
// TODO implement full spec https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol

export const onRequestPost = auth(async (ctx) => {
  // Get video content-length and content-type
  const videoUrl = 'https://pub-062aaf7b73f6408c8b3c084f3141c880.r2.dev/test_video.mp4'
  const videoResponse = await fetch(videoUrl)
  const contentLength = videoResponse.headers.get('Content-Length')!
  const contentType = videoResponse.headers.get('Content-Type')!

  // Request the upload URL
  const requestUploadUrl =
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails' // allow user to set notifySubscribers
  const requestUploadResponse = await fetch(requestUploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getEncodedJwt(ctx)}`,
      // 'Content-Length': 'Set automatically by Fetch API',
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Length': contentLength,
      'X-Upload-Content-Type': 'video/*', // hopefully read the docs right
    },
    body: JSON.stringify({
      snippet: {
        title: 'Test video upload.', // required
        categoryId: '22', // required // GET https://youtube.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=us Authorization: Bearer [YOUR_ACCESS_TOKEN]
        description: 'Description of uploaded video.', // optional
        tags: ['cool', 'video', 'more keywords'], // optional
        // defaultLanguage optional
      },
      status: {
        privacyStatus: 'private', // required
        // embeddable: true, optional?
        // license: 'youtube', optional?
      },
      // TODO allow JSON level customization via validated templates
    }),
  })

  const uploadUrl = requestUploadResponse.headers.get('Location')!
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${getEncodedJwt(ctx)}`,
      'Content-Length': contentLength,
      'Content-Type': contentType,
    },
    body: videoResponse.body,
  })

  return uploadResponse
})
