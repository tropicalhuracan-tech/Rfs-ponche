import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed, readJson } from '../../_lib/http.js'
import { requirePanel } from '../../_lib/auth.js'
import { getGuard, listDevices, normalizeGuard, setGuard } from '../../_lib/store.js'
import { sendGuardPush } from '../../_lib/push.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  const auth = requirePanel(req)
  if (!auth.ok) return json(res, auth.status, { error: auth.error })
  const name = normalizeGuard(String(req.query.name || ''))
  const body = readJson<{ minutes?: number; sound?: string }>(req)
  const minutes = Math.max(1, Number(body.minutes) || 15)
  const sound = body.sound === 'horn' || body.sound === 'pulse' ? body.sound : 'wail'
  const until = new Date(Date.now() + minutes * 60_000).toISOString()
  const prev = await getGuard(name)
  await setGuard(name, { ...prev, alertUntil: until, alertSound: sound })

  const devices = await listDevices()
  const targets = devices.filter((d) => normalizeGuard(d.vigilanteName) === name)
  let sent = 0
  let failed = 0
  let skipped = 0
  for (const device of targets) {
    if (!device.pushSubscription) {
      skipped += 1
      continue
    }
    const result = await sendGuardPush(device.pushSubscription, {
      kind: 'remote-alert',
      title: '¡ALERTA RFS!',
      body: 'Central activa la sirena. Abra la app y ponche ahora.',
      url: '/',
      sound,
    })
    if (result.ok) sent += 1
    else failed += 1
  }
  return json(res, 200, { ok: true, push: { sent, failed, skipped } })
}
