const get = (key: string) => {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : null
}

const set = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export default { get, set }
