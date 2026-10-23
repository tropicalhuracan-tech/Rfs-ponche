import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed, readJson } from '../_lib/http.js'
import { getDevice, upsertDeviceProfile } from '../_lib/store.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const deviceId = String(req.query.id || '')
  if (!deviceId) return json(res, 400, { error: 'deviceId requerido' })

  if (req.method === 'GET') {
    const profile = await getDevice(deviceId)
    if (!profile) return json(res, 404, { error: 'No encontrado' })
    return json(res, 200, { profile })
  }

  if (req.method === 'PUT') {
    const body = readJson<{ vigilanteName?: string; serviceName?: string }>(req)
    if (!body.vigilanteName?.trim() || !body.serviceName?.trim()) {
      return json(res, 400, { error: 'Perfil incompleto' })
    }
    const profile = await upsertDeviceProfile(deviceId, {
      vigilanteName: body.vigilanteName,
      serviceName: body.serviceName,
    })
    return json(res, 200, { ok: true, profile })
  }

  return methodNotAllowed(res)
}
