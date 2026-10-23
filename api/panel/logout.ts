import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed } from '../_lib/http.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  res.setHeader('Set-Cookie', 'rfs_panel=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
  return json(res, 200, { ok: true })
}
