import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './app-shell.css'
import './dither.css'
import './chrome-v3.css'
import './theme.css'
import './appearance-control.css'
import './pwa.css'
import './virtualization.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
)
