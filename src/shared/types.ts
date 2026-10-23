export type AlertSound = 'wail' | 'horn' | 'pulse'

export type DeviceProfile = {
  deviceId: string
  vigilanteName: string
  serviceName: string
  code?: string
  updatedAt: string
  pushSubscription?: unknown | null
  lastActivityAt?: string | null
  lastOverduePushAt?: string | null
}

export type PonchePayload = {
  id: string
  timestamp: string
  latitude: number
  longitude: number
  accuracy?: number | null
  vigilanteName: string
  serviceName: string
  deviceId: string
}

export type PhotoPayload = {
  id: string
  timestamp: string
  dataUrl: string
  latitude?: number
  longitude?: number
  vigilanteName: string
  serviceName: string
  deviceId: string
}

export type RfsEvent = {
  id: string
  type: 'ponche' | 'photo'
  timestamp: string
  vigilanteName: string
  serviceName: string
  deviceId?: string
  latitude?: number | null
  longitude?: number | null
  accuracy?: number | null
  receivedAt?: string
  dataUrl?: string
  imageUrl?: string
}

export type GuardModeration = {
  blocked?: boolean
  alertUntil?: string | null
  alertSound?: AlertSound | null
  resetAt?: string | null
}

export type DeviceSignal = {
  alertActive: boolean
  alertUntil: string | null
  alertSound: AlertSound | null
  blocked: boolean
  vigilanteName: string | null
}

export type PanelDevice = {
  deviceId: string
  vigilanteName: string
  serviceName: string
  code?: string | null
  updatedAt: string
  pushEnabled?: boolean
}
