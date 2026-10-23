import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed } from '../_lib/http.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res)
  try {
    const upstream = await fetch('https://rfs-ponche.vercel.app/api/radio/tremenda')
    const data = await upstream.json()
    return json(res, 200, data)
  } catch {
    return json(res, 200, { ok: true, episodes: [] })
  }
}
