type VideoData = {
  /** Types not yet implemented */
  author: never
  createTime: string
  /** Video title  */
  desc: string
  /** Categories */
  diversificationLabels: string[]
  id: string
  /** e.g. US */
  locationCreated: string
  /** Types not yet implemented */
  music: never
  /** e.g. ['coca cola factory', ...] */
  suggestedWords: string[]
  /** Types not yet implemented */
  textExtra: never[]
  video: {
    bitrate: number
    /** Types not yet implemented */
    bitrateInfo: never[]
    codecType: string
    cover: string
    definition: string
    /** Alternative video URL */
    downloadAddr: string
    duration: number
    dynamicCover: string
    format: string
    height: number
    originCover: string
    /** Video URL */
    playAddr: string
    ratio: string
    /** Types not yet implemented */
    subtitleInfos: never
    width: number
  }
}

type VideoHeaders = {
  headers: {
    tt_chain_token: string
  }
}

export const scrapeTikTokUrl = async (url: string) => {
  const res = await fetch(url)
  const tt_chain_token = res.headers.getSetCookie().find((x) => x.startsWith('tt_chain_token'))!
  const htmlText = await res.text()

  const htmlRegex = new RegExp(`<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">(.*?)</script>`, 'g') // prettier-ignore
  const pageDataText = htmlRegex.exec(htmlText)?.[1] || 'null'
  const pageData = JSON.parse(pageDataText)

  if (!pageData) {
    throw new Error(`Unable to parse data from TikTok URL: ${url}`)
  }

  const videoData = pageData.__DEFAULT_SCOPE__['webapp.video-detail'].itemInfo.itemStruct as VideoData & VideoHeaders

  videoData.headers = { tt_chain_token }

  return videoData
}
