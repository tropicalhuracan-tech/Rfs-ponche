import { kv } from '@vercel/kv'

export type StoredDevice = {
  deviceId: string
  vigilanteName: string
  serviceName: string
  code: string
  updatedAt: string
  pushSubscription?: unknown | null
  lastActivityAt?: string | null
  lastOverduePushAt?: string | null
}

export type StoredEvent = {
  id: string
  type: 'ponche' | 'photo'
  timestamp: string
  vigilanteName: string
  serviceName: string
  deviceId?: string
  latitude?: number | null
  longitude?: number | null
  accuracy?: number | null
  receivedAt: string
  dataUrl?: string
  imageUrl?: string
}

export type GuardState = {
  blocked?: boolean
  alertUntil?: string | null
  alertSound?: 'wail' | 'horn' | 'pulse' | null
  resetAt?: string | null
}

const EVENTS_INDEX = 'rfs:v1:event-ids'
const deviceKey = (id: string) => `rfs:v1:device:${id}`
const codeKey = (code: string) => `rfs:v1:code:${code.toUpperCase().replace(/[^A-Z0-9]/g, '')}`
const eventKey = (id: string) => `rfs:v1:event:${id}`
const photoKey = (id: string) => `rfs:v1:photo:${id}`
const guardKey = (name: string) => `rfs:v1:guard:${normalizeGuard(name)}`

export function normalizeGuard(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

function randomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let raw = ''
  for (let i = 0; i < 6; i += 1) raw += alphabet[Math.floor(Math.random() * alphabet.length)]
  return raw
}

export async function getDevice(deviceId: string) {
  return (await kv.get<StoredDevice>(deviceKey(deviceId))) ?? null
}

export async function putDevice(device: StoredDevice): Promise<void> {
  await kv.set(deviceKey(device.deviceId), device)
  await kv.set(codeKey(device.code), device.deviceId)
}

export async function resolveCode(code: string) {
  const id = await kv.get<string>(codeKey(code))
  return id ? await getDevice(id) : null
}

export async function upsertDeviceProfile(
  deviceId: string,
  profile: { vigilanteName: string; serviceName: string },
  existingCode?: string,
) {
  const now = new Date().toISOString()
  const prev = await getDevice(deviceId)
  const code = existingCode || prev?.code || randomCode()
  const device: StoredDevice = {
    deviceId,
    vigilanteName: profile.vigilanteName.trim(),
    serviceName: profile.serviceName.trim(),
    code,
    updatedAt: now,
    pushSubscription: prev?.pushSubscription ?? null,
    lastActivityAt: now,
    lastOverduePushAt: prev?.lastOverduePushAt ?? null,
  }
  await putDevice(device)
  return device
}

export async function appendEvent(event: StoredEvent) {
  await kv.set(eventKey(event.id), event)
  await kv.lpush(EVENTS_INDEX, event.id)
  await kv.ltrim(EVENTS_INDEX, 0, 4999)
}

export async function listEvents(limit = 500) {
  const ids = (await kv.lrange<string>(EVENTS_INDEX, 0, limit - 1)) ?? []
  const events: StoredEvent[] = []
  for (const id of ids) {
    const ev = await kv.get<StoredEvent>(eventKey(id))
    if (ev) events.push(ev)
  }
  return events
}

export async function getEvent(id: string) {
  return (await kv.get<StoredEvent>(eventKey(id))) ?? null
}

export async function deleteEvent(id: string) {
  await kv.del(eventKey(id))
  await kv.del(photoKey(id))
  await kv.lrem(EVENTS_INDEX, 0, id)
}

export async function deleteDevice(deviceId: string) {
  const device = await getDevice(deviceId)
  if (!device) return false
  await kv.del(codeKey(device.code))
  await kv.del(deviceKey(deviceId))
  return true
}

/** Removes a vigilante, their events, photos, devices, and moderation state. */
export async function deleteGuard(vigilanteName: string) {
  const norm = normalizeGuard(vigilanteName)
  if (!norm) return { events: 0, devices: 0 }

  let eventsRemoved = 0
  const events = await listEvents(5000)
  for (const ev of events) {
    if (normalizeGuard(ev.vigilanteName) !== norm) continue
    await deleteEvent(ev.id)
    eventsRemoved += 1
  }

  let devicesRemoved = 0
  for (const device of await listDevices()) {
    if (normalizeGuard(device.vigilanteName) !== norm) continue
    if (await deleteDevice(device.deviceId)) devicesRemoved += 1
  }

  await kv.del(guardKey(norm))
  return { events: eventsRemoved, devices: devicesRemoved }
}

export async function storePhotoBytes(id: string, bytes: Buffer) {
  await kv.set(photoKey(id), bytes.toString('base64'))
}

export async function readPhotoBytes(id: string) {
  const b64 = await kv.get<string>(photoKey(id))
  return b64 ? Buffer.from(b64, 'base64') : null
}

export async function listDevices() {
  const keys = await kv.keys('rfs:v1:device:*')
  const devices: StoredDevice[] = []
  for (const key of keys) {
    const d = await kv.get<StoredDevice>(key)
    if (d) devices.push(d)
  }
  return devices
}

export async function getGuard(name: string) {
  return (await kv.get<GuardState>(guardKey(name))) ?? {}
}

export async function setGuard(name: string, state: GuardState) {
  await kv.set(guardKey(name), state)
}

export async function allGuards(events: StoredEvent[]) {
  const map: Record<string, GuardState> = {}
  const names = new Set(events.map((e) => normalizeGuard(e.vigilanteName)))
  for (const name of names) {
    map[name] = await getGuard(name)
  }
  return map
}
