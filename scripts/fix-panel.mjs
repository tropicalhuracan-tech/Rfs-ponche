import { readFileSync, writeFileSync } from 'node:fs'

let src = readFileSync('/workspace/src/panel/PanelApp.tsx', 'utf8')

src = src.replace(
  /^import[\s\S]*?^const S = React[\s\S]*?^const C[\s\S]*?\n/m,
  `/* Recovered from production bundle — panel central */
import React, { useEffect, useMemo, useState } from 'react'
import * as api from '../shared/api'

const S = React
const L = { jsx: React.createElement, jsxs: React.createElement, Fragment: React.Fragment }

const periodLabels = {
`,
)

src = src.replace(/^  C = r\(\),\s*\n\s*w = \{/m, 'const w = {')

const apiCalls = [
  ['await u(', 'await api.loginPanel('],
  ['await l()', 'await api.logoutPanel()'],
  ['await ee()', 'await api.fetchPanelEvents()'],
  ['await x()', 'await api.backupRun()'],
  ['await t(', 'await api.alertGuard('],
  ['await n(', 'await api.stopGuardAlert('],
  ['await o(', 'await api.resetGuard('],
  ['await v(', 'await api.setGuardBlocked('],
  ['await s(', 'await api.deletePhoto('],
  ['await p(', 'await api.downloadPhoto('],
  ['await i(', 'await api.sendReportEmail('],
  ['b(e)', 'api.photoSrcUrl(e)'],
  ['a(e)', 'api.photoDownloadUrl(e)'],
  ['g(', 'api.guardAlertActive('],
  ['d(', 'api.sirenFileFor('],
  ['_(', 'api.sirenPresets['], // risky - skip
  ['!!c()', '!!api.getPanelKey()'],
  ['!c()', '!api.getPanelKey()'],
  ['e instanceof h', 'e instanceof api.CentralHttpError'],
  ['e instanceof f', 'e instanceof api.CentralHttpError'],
  ['w[e.period]', 'periodLabels[e.period]'],
]

for (const [from, to] of apiCalls) {
  src = src.split(from).join(to)
}

src = src.replace(/\by\(\)\s*\nC\.createRoot[\s\S]*$/m, '')
src = src.replace(/\b_\b/g, 'api.sirenPresets') // might break - undo careful

writeFileSync('/workspace/src/panel/PanelApp.tsx', src)
console.log('fixed panel')
