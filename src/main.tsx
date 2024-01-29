import { lazy } from 'solid-js'
import { render } from 'solid-js/web'
import { Route, Router } from '@solidjs/router'
import Layout from './components/Layout'
import Home from './pages/home'
import './global.css'
import Privacy from './pages/privacy'
import Terms from './pages/terms'
import Settings from './pages/settings'

render(() => {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="**" component={lazy(() => import('./pages/404'))} />
    </Router>
  )
}, document.getElementById('app') as HTMLElement)
