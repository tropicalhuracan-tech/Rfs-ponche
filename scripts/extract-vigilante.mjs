import { readFileSync, writeFileSync } from 'node:fs'

const src = readFileSync('/tmp/rfs-recover/main-pretty.js', 'utf8')
const lines = src.split('\n')
const body = lines.slice(2205, 4255).join('\n')

const header = `/* Recovered from production bundle — vigilante app */
import React, { useEffect, useRef, useState } from 'react'
import {
  CentralHttpError as u,
  postPhoto as t,
  saveDeviceProfile as r,
  normalizeAlertSound as i,
  getDeviceSignal as a,
  sirenFileFor as o,
  fetchDeviceProfile as c,
  postPonche as f,
  recoverDeviceProfile as p,
} from '../shared/api'
import { CameraCapture } from './camera'

const b = React
const $ = {
  jsx: React.createElement,
  jsxs: React.createElement,
  Fragment: React.Fragment,
}

`

const footer = `
export default function VigilanteApp() {
  return $.jsx(ni, {})
}
`

let out = header + '\n' + body + footer
out = out.replace(/\(0, \$\.(jsx|jsxs)\)/g, '($.$1)')
out = out.replace(/^var En = n\(\),[\s\S]*?^function kn/m, 'function kn')

writeFileSync('/workspace/src/vigilante/VigilanteApp.tsx', out)
console.log('Wrote VigilanteApp.tsx', out.length)
