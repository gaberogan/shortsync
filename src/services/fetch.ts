export const fetchText = (...args: Parameters<typeof fetch>) => {
  return fetch(...args).then((res) => res.text())
}

export const fetchJSON = <T>(...args: Parameters<typeof fetch>): Promise<T> => {
  return fetch(...args).then((res) => res.json())
}
