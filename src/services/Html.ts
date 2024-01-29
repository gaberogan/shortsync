export const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.setAttribute('async', '')
    script.onload = resolve
    script.setAttribute('src', src)
    document.head.appendChild(script)
  })
}

export const loadInlineCss = (cssText: string) => {
  const style = document.createElement('style')
  style.textContent = cssText
  document.head.appendChild(style)
}
