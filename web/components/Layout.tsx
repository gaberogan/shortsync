import { JSX } from 'solid-js'
import { css } from '@emotion/css'

export default function Layout(props: any): JSX.Element {
  return (
    <div class={style}>
      {/* <nav>nav</nav> */}
      <main>{props.children}</main>
      {/* <aside>aside</aside> */}
    </div>
  )
}

const style = css`
  height: 100vh;
  display: grid;
`
