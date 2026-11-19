import React from 'react'
import { createRoot } from 'react-dom/client'
// The scientific publication system uses the exact Inter sans-serif brand face.
import './fonts.css'
import App from './App'
import './styles.css'
import './app-shell.css'
import './journal-loading.css'
import './dither.css'
import './chrome-v3.css'
import './theme.css'
import './appearance-control.css'
import './pwa.css'
import './virtualization.css'
import './article-toc.css'
import './spotlight.css'
import './expanded-sidebar.css'
import './mobile-scrollbar.css'
import './research-mobile-menu.css'
import './journal-sticky-bar.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
)
