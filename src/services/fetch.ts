import _ from 'lodash'

export const fetchText = (...args: Parameters<typeof fetch>) => {
  return fetch(...args).then((res) => res.text())
}

export const fetchJSON = <T>(...args: Parameters<typeof fetch>): Promise<T> => {
  return fetch(...args).then((res) => res.json())
}

// TODO seems if called twice at same time it makes 2 calls

export const fetchTextMemo = _.memoize(fetchText)

export const fetchJSONMemo = _.memoize(fetchJSON)
