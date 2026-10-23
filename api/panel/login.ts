import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed, readJson } from '../_lib/http.js'
import { panelPassword } from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  const expected = panelPassword()
  const body = readJson<{ password?: string }>(req)
  if (!expected || body.password !== expected) {
    return json(res, 401, { error: 'Clave incorrecta' })
  }
  res.setHeader('Set-Cookie', `rfs_panel=${encodeURIComponent(expected)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`)
  return json(res, 200, { ok: true })
}
