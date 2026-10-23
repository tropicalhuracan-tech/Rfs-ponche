import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed } from '../../_lib/http.js'
import { requirePanel } from '../../_lib/auth.js'
import { getGuard, normalizeGuard, setGuard } from '../../_lib/store.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  const auth = requirePanel(req)
  if (!auth.ok) return json(res, auth.status, { error: auth.error })
  const name = normalizeGuard(String(req.query.name || ''))
  const prev = await getGuard(name)
  await setGuard(name, { ...prev, resetAt: new Date().toISOString() })
  return json(res, 200, { ok: true })
}
