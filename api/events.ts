import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed } from './_lib/http.js'
import { requirePanel } from './_lib/auth.js'
import { allGuards, getGuard, listDevices, listEvents, normalizeGuard } from './_lib/store.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res)
  const auth = requirePanel(req)
  if (!auth.ok) return json(res, auth.status, { error: auth.error })
  const limit = Math.min(500, Number(req.query.limit) || 500)
  let events = await listEvents(limit)
  const moderation = await allGuards(events)
  const devices = await listDevices().then((list) =>
    list.map((d) => ({
      deviceId: d.deviceId,
      vigilanteName: d.vigilanteName,
      serviceName: d.serviceName,
      code: d.code,
      updatedAt: d.updatedAt,
      pushEnabled: !!d.pushSubscription,
    })),
  )
  for (const ev of events) {
    const g = await getGuard(normalizeGuard(ev.vigilanteName))
    if (g.resetAt && new Date(ev.timestamp) < new Date(g.resetAt)) continue
  }
  events = events.filter((ev) => {
    const g = moderation[normalizeGuard(ev.vigilanteName)]
    if (!g?.resetAt) return true
    return new Date(ev.timestamp) >= new Date(g.resetAt)
  })
  return json(res, 200, { events, moderation, devices })
}
