import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import './global.css'

const App = () => {
  const [counter, setCounter] = createSignal(0)

  return (
    <div>
      <h1>ShortSync</h1>
      <div class="card">
        <button
          onClick={(e) => {
            e.preventDefault()
            setCounter(counter() + 1)
          }}
        >
          count is {counter()}
        </button>
      </div>
      <p class="read-the-docs">Click on the Vite and Solid logos to learn more</p>
    </div>
  )
}

render(() => <App />, document.getElementById('app') as HTMLElement)
