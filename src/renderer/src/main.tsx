import * as Sentry from '@sentry/electron/renderer'
import { init as reactInit } from '@sentry/react'
import { sanitizeSentryEvent } from '../../shared/sentryPrivacy'

Sentry.init(
  {
    sendDefaultPii: false,
    beforeSend(event) {
      return sanitizeSentryEvent(event)
    }
  },
  reactInit
)


import './assets/main.css'


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
