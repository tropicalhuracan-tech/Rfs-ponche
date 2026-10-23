import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../shared/base.css'
import './panel.css'
import { registerServiceWorker } from '../shared/api'
import PanelApp from './PanelApp'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PanelApp />
  </StrictMode>,
)
