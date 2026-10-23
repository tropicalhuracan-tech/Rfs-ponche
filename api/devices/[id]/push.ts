import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed, readJson } from '../../_lib/http.js'
import { getDevice, putDevice } from '../../_lib/store.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const deviceId = String(req.query.id || '')
  if (req.method !== 'PUT') return methodNotAllowed(res)
  const device = await getDevice(deviceId)
  if (!device) return json(res, 404, { error: 'Dispositivo no configurado' })
  const body = readJson<{ subscription?: unknown | null }>(req)
  device.pushSubscription = body.subscription ?? null
  device.updatedAt = new Date().toISOString()
  await putDevice(device)
  return json(res, 200, { ok: true })
}
