import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed } from '../_lib/http.js'
import { configureWebPush } from '../_lib/push.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res)
  const { publicKey } = configureWebPush()
  if (!publicKey) return json(res, 503, { error: 'Push no configurado' })
  return json(res, 200, { publicKey })
}
