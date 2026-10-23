import type { VercelRequest, VercelResponse } from '@vercel/node'

export function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Credentials', 'true')
  res.json(body)
}

export function methodNotAllowed(res: VercelResponse) {
  json(res, 405, { error: 'Method not allowed' })
}

export function readJson<T>(req: VercelRequest): T {
  return typeof req.body === 'string' ? JSON.parse(req.body) : (req.body as T)
}
