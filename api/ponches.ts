import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed, readJson } from './_lib/http.js'
import { appendEvent, getGuard, normalizeGuard, upsertDeviceProfile } from './_lib/store.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  const body = readJson<Record<string, unknown>>(req)
  const required = ['id', 'timestamp', 'latitude', 'longitude', 'vigilanteName', 'serviceName', 'deviceId']
  if (required.some((k) => body[k] == null || body[k] === '')) {
    return json(res, 400, { error: 'Datos de ponche incompletos' })
  }
  const guard = await getGuard(normalizeGuard(String(body.vigilanteName)))
  if (guard.blocked) {
    return json(res, 403, { error: 'Vigilante bloqueado por central' })
  }
  const receivedAt = new Date().toISOString()
  const event = {
    id: String(body.id),
    type: 'ponche' as const,
    timestamp: String(body.timestamp),
    latitude: Number(body.latitude),
    longitude: Number(body.longitude),
    accuracy: body.accuracy == null ? null : Number(body.accuracy),
    vigilanteName: String(body.vigilanteName),
    serviceName: String(body.serviceName),
    deviceId: String(body.deviceId),
    receivedAt,
  }
  await upsertDeviceProfile(event.deviceId, {
    vigilanteName: event.vigilanteName,
    serviceName: event.serviceName,
  })
  await appendEvent(event)
  return json(res, 200, { ok: true, event })
}
