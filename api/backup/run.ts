import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed } from '../_lib/http.js'
import { requirePanel } from '../_lib/auth.js'
import { listEvents } from '../_lib/store.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  const auth = requirePanel(req)
  if (!auth.ok) return json(res, auth.status, { error: auth.error })
  const events = await listEvents(5000)
  const photos = events.filter((e) => e.type === 'photo').length
  return json(res, 200, { ok: true, at: new Date().toISOString(), events: events.length, photos })
}
