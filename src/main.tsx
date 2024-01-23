import { lazy } from 'solid-js'
import { render } from 'solid-js/web'
import { Route, Router } from '@solidjs/router'
import Layout from './components/Layout'
import Home from './pages/home'
import './global.css'

render(() => {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="**" component={lazy(() => import('./pages/404'))} />
    </Router>
  )
}, document.getElementById('app') as HTMLElement)
