export const fetchText = (...args: Parameters<typeof fetch>) => {
  return fetch(...args).then((res) => res.text())
}

export const fetchJSON = <T>(...args: Parameters<typeof fetch>): Promise<T> => {
  return fetch(...args).then((res) => res.json())
}

export const fetchHeadAndAbort = async (url: string, options: RequestInit<RequestInitCfProperties>) => {
  const controller = new AbortController()
  options.signal = controller.signal
  const response = await fetch(url, options)
  controller.abort()
  return response
}
