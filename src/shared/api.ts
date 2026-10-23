import React from 'react'
import type {
  AlertSound,
  DeviceProfile,
  DeviceSignal,
  GuardModeration,
  PanelDevice,
  PhotoPayload,
  PonchePayload,
  RfsEvent,
} from './types'

const API_BASE = ''

const PANEL_KEY_STORAGE = 'rfs.panelKey'

export class CentralHttpError extends Error {
  status: number
  permanent: boolean

  constructor(message: string, status: number) {
    super(message)
    this.name = 'CentralHttpError'
    this.status = status
    this.permanent = status === 400 || status === 403 || status === 413
  }
}

export function getPanelKey(): string {
  try {
    return sessionStorage.getItem(PANEL_KEY_STORAGE) || ''
  } catch {
    return ''
  }
}

function setPanelKey(key: string) {
  try {
    sessionStorage.setItem(PANEL_KEY_STORAGE, key)
  } catch {
    /* ignore */
  }
}

export function clearPanelKey() {
  try {
    sessionStorage.removeItem(PANEL_KEY_STORAGE)
  } catch {
    /* ignore */
  }
}

function panelHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra)
  const key = getPanelKey()
  if (key) {
    headers.set('Authorization', `Bearer ${key}`)
    headers.set('X-RFS-Panel-Key', key)
  }
  return headers
}

async function panelFetch(path: string, init?: RequestInit) {
  const headers = panelHeaders(init?.headers)
  return fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' })
}

async function readError(res: Response, fallback: string) {
  const text = await res.text()
  try {
    const json = JSON.parse(text) as { error?: string }
    if (json.error) return String(json.error)
  } catch {
    /* ignore */
  }
  return (text || fallback).slice(0, 160)
}

export function normalizeProfile<T extends { vigilanteName: string; serviceName: string; code?: string }>(
  profile: T,
) {
  const code = profile.code?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  return {
    vigilanteName: profile.vigilanteName,
    serviceName: profile.serviceName,
    ...(code ? { code } : {}),
  }
}

export async function loginPanel(password: string) {
  const res = await fetch(`${API_BASE}/api/panel/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) throw new Error(await readError(res, 'Clave incorrecta'))
  setPanelKey(password)
}

export async function logoutPanel() {
  try {
    await fetch(`${API_BASE}/api/panel/logout`, { method: 'POST', credentials: 'include' })
  } finally {
    clearPanelKey()
  }
}

export async function postPonche(payload: PonchePayload) {
  const res = await fetch(`${API_BASE}/api/ponches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new CentralHttpError(await readError(res, 'No se pudo enviar el ponche a central'), res.status)
  }
}

export async function postPhoto(payload: PhotoPayload) {
  const res = await fetch(`${API_BASE}/api/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new CentralHttpError(await readError(res, 'No se pudo enviar la foto a central'), res.status)
  }
}

export async function saveDeviceProfile(deviceId: string, profile: { vigilanteName: string; serviceName: string }) {
  const res = await fetch(`${API_BASE}/api/devices/${encodeURIComponent(deviceId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
  if (!res.ok) throw new Error('No se pudo guardar el perfil en central. Revise su conexión.')
  const json = (await res.json()) as { profile: DeviceProfile }
  return normalizeProfile(json.profile)
}

export async function fetchDeviceProfile(deviceId: string) {
  const res = await fetch(`${API_BASE}/api/devices/${encodeURIComponent(deviceId)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('No se pudo recuperar el perfil')
  const json = (await res.json()) as { profile: DeviceProfile }
  return normalizeProfile(json.profile)
}

export async function recoverDeviceProfile(code: string, deviceId: string) {
  const res = await fetch(`${API_BASE}/api/devices/recover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, deviceId }),
  })
  if (!res.ok) throw new Error(await readError(res, 'No se pudo recuperar con ese código'))
  const json = (await res.json()) as { profile: DeviceProfile }
  return normalizeProfile(json.profile)
}

export function guardAlertActive(moderation?: GuardModeration | null) {
  if (!moderation?.alertUntil) return false
  const until = new Date(moderation.alertUntil).getTime()
  return Number.isFinite(until) && until > Date.now()
}

export async function fetchPanelEvents() {
  let res: Response
  try {
    res = await panelFetch('/api/events?limit=500')
  } catch {
    throw new Error('Sin conexión con central. Revise la red e intente de nuevo.')
  }
  if (res.status === 401) throw new CentralHttpError('Sesión de central requerida', 401)
  if (!res.ok) throw new Error('No se pudo cargar el panel')
  const json = (await res.json()) as {
    events?: RfsEvent[]
    moderation?: Record<string, GuardModeration>
    devices?: PanelDevice[]
  }
  return {
    events: json.events ?? [],
    moderation: json.moderation ?? {},
    devices: json.devices ?? [],
  }
}

export function photoSrcUrl(event: RfsEvent) {
  if (event.dataUrl) return event.dataUrl
  if (event.imageUrl) return event.imageUrl
  return `/api/photos/${encodeURIComponent(event.id)}`
}

export function photoDownloadUrl(event: RfsEvent) {
  return `/api/photos/${encodeURIComponent(event.id)}?download=1`
}

function photoFilename(event: RfsEvent) {
  return `rfs-${event.vigilanteName.replace(/\s+/g, '-') || 'foto'}-${event.timestamp.slice(0, 19).replace(/[:T]/g, '-')}.jpg`
}

export async function downloadPhoto(event: RfsEvent) {
  const url = photoDownloadUrl(event)
  const filename = photoFilename(event)
  const res = await panelFetch(url)
  if (!res.ok) throw new Error('No se pudo descargar la foto')
  const blob = await res.blob()
  const file = new File([blob], filename, { type: blob.type || 'image/jpeg' })
  const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void>; canShare?: (data: ShareData) => boolean }
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches &&
    typeof nav.share === 'function' &&
    (!nav.canShare || nav.canShare({ files: [file] }))
  ) {
    try {
      await nav.share({ files: [file], title: filename })
      return
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
    }
  }
  const objectUrl = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000)
  }
}

export async function setGuardBlocked(vigilanteName: string, blocked: boolean) {
  const res = await panelFetch(`/api/guards/${encodeURIComponent(vigilanteName)}/block`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocked }),
  })
  if (!res.ok) throw new Error('No se pudo actualizar el bloqueo')
}

export async function resetGuard(vigilanteName: string) {
  const res = await panelFetch(`/api/guards/${encodeURIComponent(vigilanteName)}/reset`, { method: 'POST' })
  if (!res.ok) throw new Error('No se pudo reiniciar el conteo')
}

export async function alertGuard(vigilanteName: string, minutes = 15, sound: AlertSound = 'wail') {
  const res = await panelFetch(`/api/guards/${encodeURIComponent(vigilanteName)}/alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ minutes, sound }),
  })
  if (!res.ok) throw new Error(await readError(res, 'No se pudo activar la sirena'))
  const json = (await res.json().catch(() => ({}))) as { push?: { sent?: number; failed?: number; skipped?: number } }
  return {
    push: {
      sent: Number(json.push?.sent) || 0,
      failed: Number(json.push?.failed) || 0,
      skipped: Number(json.push?.skipped) || 0,
    },
  }
}

export async function stopGuardAlert(vigilanteName: string) {
  const res = await panelFetch(`/api/guards/${encodeURIComponent(vigilanteName)}/alert/stop`, { method: 'POST' })
  if (!res.ok) throw new Error(await readError(res, 'No se pudo detener la sirena'))
}

export async function getDeviceSignal(deviceId: string): Promise<DeviceSignal> {
  const res = await fetch(`${API_BASE}/api/devices/${encodeURIComponent(deviceId)}/signal`)
  if (!res.ok) {
    return {
      alertActive: false,
      alertUntil: null,
      alertSound: null,
      blocked: false,
      vigilanteName: null,
    }
  }
  const json = (await res.json()) as {
    alertActive?: boolean
    alertUntil?: string | null
    alertSound?: string | null
    blocked?: boolean
    vigilanteName?: string | null
  }
  const sound = json.alertSound
  return {
    alertActive: !!json.alertActive,
    alertUntil: json.alertUntil ?? null,
    alertSound: sound === 'horn' || sound === 'pulse' || sound === 'wail' ? sound : null,
    blocked: !!json.blocked,
    vigilanteName: json.vigilanteName ?? null,
  }
}

export async function sendReportEmail(body: unknown) {
  const res = await panelFetch('/api/reports/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return await res.json()
}

export async function backupRun() {
  const res = await panelFetch('/api/backup/run', { method: 'POST' })
  if (!res.ok) throw new Error(await readError(res, 'No se pudo respaldar'))
  return await res.json()
}

export async function deletePhoto(id: string) {
  const res = await panelFetch(`/api/photos/${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await readError(res, 'No se pudo borrar la foto'))
}

export const alertSounds: AlertSound[] = ['wail', 'horn', 'pulse']

export const sirenPresets = [
  { id: 'wail' as const, label: 'Clásica', hint: 'Aullido continuo tipo policía', file: '/sirena-wail.wav' },
  { id: 'horn' as const, label: 'Bocina', hint: 'Dos tonos graves y fuertes', file: '/sirena-horn.wav' },
  { id: 'pulse' as const, label: 'Pulsos', hint: 'Alarmas cortas urgentes', file: '/sirena-pulse.wav' },
]

export function normalizeAlertSound(sound: unknown): AlertSound {
  return typeof sound === 'string' && alertSounds.includes(sound as AlertSound) ? (sound as AlertSound) : 'wail'
}

export function sirenFileFor(sound: unknown) {
  const id = normalizeAlertSound(sound)
  return sirenPresets.find((p) => p.id === id)?.file ?? '/sirena-wail.wav'
}

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}

export const jsxRuntime = {
  jsx: (type: unknown, props: unknown) => {
    const p = props as Record<string, unknown>
    const { children, ...rest } = p ?? {}
    return React.createElement(type as never, rest, children)
  },
  jsxs: (type: unknown, props: unknown) => {
    const p = props as Record<string, unknown>
    const { children, ...rest } = p ?? {}
    return React.createElement(type as never, rest, children)
  },
  Fragment: React.Fragment,
}

// Re-export createRoot alias used by recovered panel bundle
export { createRoot } from 'react-dom/client'

// Unused in vigilante bundle but imported by extractor
export const Outlet = () => null
