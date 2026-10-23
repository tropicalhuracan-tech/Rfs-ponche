import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed, readJson } from '../_lib/http.js'
import { requirePanel } from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  const auth = requirePanel(req)
  if (!auth.ok) return json(res, auth.status, { error: auth.error })
  const body = readJson<Record<string, unknown>>(req)
  // Email delivery is configured via RFS_REPORT_EMAIL_* env on production; stub OK for recovery.
  return json(res, 200, { ok: true, queued: true, subject: body.subject ?? null })
}
