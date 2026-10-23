import type { VercelRequest } from '@vercel/node'

export function panelPassword() {
  return process.env.RFS_PANEL_PASSWORD || process.env.PANEL_PASSWORD || ''
}

export function isPanelAuthorized(req: VercelRequest) {
  const expected = panelPassword()
  if (!expected) return false
  const auth = req.headers.authorization || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const headerKey = req.headers['x-rfs-panel-key']
  const key = typeof headerKey === 'string' ? headerKey : Array.isArray(headerKey) ? headerKey[0] : ''
  const cookie = req.cookies?.rfs_panel || ''
  return bearer === expected || key === expected || cookie === expected
}

export function requirePanel(req: VercelRequest) {
  if (!isPanelAuthorized(req)) {
    return { ok: false as const, status: 401, error: 'Acceso de central requerido' }
  }
  return { ok: true as const }
}
