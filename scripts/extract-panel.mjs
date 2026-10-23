import { readFileSync, writeFileSync } from 'node:fs'

const src = readFileSync('/tmp/rfs-recover/panel-pretty.js', 'utf8')
const lines = src.split('\n')
const body = lines.slice(26, 1968).join('\n')

const header = `/* Recovered from production bundle — panel central */
import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  CentralHttpError as f,
  alertGuard as t,
  stopGuardAlert as n,
  createRoot as r,
  sendReportEmail as i,
  photoDownloadUrl as a,
  resetGuard as o,
  deletePhoto as s,
  getPanelKey as c,
  logoutPanel as l,
  loginPanel as u,
  sirenFileFor as d,
  guardAlertActive as g,
  sirenPresets as _,
  setGuardBlocked as v,
  registerServiceWorker as y,
  backupRun as x,
  fetchPanelEvents as ee,
  photoSrcUrl as b,
  downloadPhoto as p,
} from '../shared/api'

const S = React
const L = { jsx: React.createElement, jsxs: React.createElement, Fragment: React.Fragment }
const C = { createRoot }
`

const footer = `
y()
C.createRoot(document.getElementById('root')!).render(
  L.jsx(S.StrictMode, { children: L.jsx(G, {}) }),
)
`

let out = header + '\n' + body + footer
out = out.replace(/\(0, L\.(jsx|jsxs)\)/g, '(L.$1)')
out = out.replace(/var S = e\(f\(\), 1\),\s*C = r\(\),?\s*/g, '')
out = out.replace(/\(y\(\),\s*\(0, C\.createRoot[\s\S]*$/m, '')

writeFileSync('/workspace/src/panel/PanelApp.tsx', out)
console.log('Wrote PanelApp.tsx')
