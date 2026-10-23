import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed, readJson } from './_lib/http.js'
import {
  appendEvent,
  getGuard,
  normalizeGuard,
  storePhotoBytes,
  upsertDeviceProfile,
} from './_lib/store.js'

const MAX_DATA_URL = 1_200_000

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  const body = readJson<Record<string, unknown>>(req)
  const required = ['id', 'timestamp', 'dataUrl', 'vigilanteName', 'serviceName', 'deviceId']
  if (required.some((k) => !body[k])) {
    return json(res, 400, { error: 'Datos de foto incompletos' })
  }
  const dataUrl = String(body.dataUrl)
  if (dataUrl.length > MAX_DATA_URL) {
    return json(res, 413, { error: 'Foto demasiado grande' })
  }
  const guard = await getGuard(normalizeGuard(String(body.vigilanteName)))
  if (guard.blocked) {
    return json(res, 403, { error: 'Vigilante bloqueado por central' })
  }
  const match = /^data:image\/[a-z+]+;base64,(.+)$/i.exec(dataUrl)
  if (!match) return json(res, 400, { error: 'Datos de foto incompletos' })
  const id = String(body.id)
  await storePhotoBytes(id, Buffer.from(match[1], 'base64'))
  const receivedAt = new Date().toISOString()
  const event = {
    id,
    type: 'photo' as const,
    timestamp: String(body.timestamp),
    vigilanteName: String(body.vigilanteName),
    serviceName: String(body.serviceName),
    deviceId: String(body.deviceId),
    latitude: body.latitude == null ? undefined : Number(body.latitude),
    longitude: body.longitude == null ? undefined : Number(body.longitude),
    receivedAt,
    imageUrl: `/api/photos/${encodeURIComponent(id)}`,
  }
  await upsertDeviceProfile(event.deviceId!, {
    vigilanteName: event.vigilanteName,
    serviceName: event.serviceName,
  })
  await appendEvent(event)
  return json(res, 200, { ok: true, event })
}
