import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed, readJson } from '../_lib/http.js'
import { resolveCode, upsertDeviceProfile } from '../_lib/store.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  const body = readJson<{ code?: string; deviceId?: string }>(req)
  if (!body.code || !body.deviceId) return json(res, 400, { error: 'Código inválido' })
  const found = await resolveCode(body.code)
  if (!found) return json(res, 400, { error: 'Código inválido' })
  const profile = await upsertDeviceProfile(body.deviceId, found, found.code)
  return json(res, 200, { ok: true, profile })
}
