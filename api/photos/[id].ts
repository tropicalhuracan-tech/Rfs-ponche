import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, methodNotAllowed } from '../_lib/http.js'
import { requirePanel } from '../_lib/auth.js'
import { deleteEvent, getEvent, readPhotoBytes } from '../_lib/store.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = String(req.query.id || '')
  if (!id) return json(res, 400, { error: 'ID requerido' })

  if (req.method === 'GET') {
    const auth = requirePanel(req)
    if (!auth.ok) return json(res, auth.status, { error: auth.error })
    const bytes = await readPhotoBytes(id)
    if (!bytes) return json(res, 404, { error: 'Foto no encontrada' })
    const download = req.query.download === '1'
    res.status(200)
    res.setHeader('Content-Type', 'image/jpeg')
    if (download) {
      const ev = await getEvent(id)
      const name = ev?.vigilanteName?.replace(/\s+/g, '-') || 'foto'
      res.setHeader('Content-Disposition', `attachment; filename="rfs-${name}.jpg"`)
    }
    return res.send(bytes)
  }

  if (req.method === 'DELETE') {
    const auth = requirePanel(req)
    if (!auth.ok) return json(res, auth.status, { error: auth.error })
    await deleteEvent(id)
    return json(res, 200, { ok: true })
  }

  return methodNotAllowed(res)
}
