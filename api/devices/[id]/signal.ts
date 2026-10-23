import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed } from '../../_lib/http.js'
import { getDevice, getGuard, normalizeGuard } from '../../_lib/store.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res)
  const deviceId = String(req.query.id || '')
  const device = await getDevice(deviceId)
  if (!device) {
    return json(res, 200, {
      ok: true,
      vigilanteName: null,
      blocked: false,
      alertActive: false,
      alertUntil: null,
      alertSound: null,
    })
  }
  const guard = await getGuard(normalizeGuard(device.vigilanteName))
  const until = guard.alertUntil ? new Date(guard.alertUntil).getTime() : 0
  const alertActive = Number.isFinite(until) && until > Date.now()
  return json(res, 200, {
    ok: true,
    vigilanteName: device.vigilanteName,
    blocked: !!guard.blocked,
    alertActive,
    alertUntil: guard.alertUntil ?? null,
    alertSound: guard.alertSound ?? null,
  })
}
