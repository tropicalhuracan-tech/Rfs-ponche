/* RFS — network-first for HTML/JS; Web Push wakes vigilantes outside the app. */
const CACHE = 'rfs-shell-v11'
const OVERDUE_MS = 2 * 60 * 60 * 1000
const SHELL = [
  '/logo.jpg',
  '/logo-tight.jpg',
  '/logo-panel.jpg',
  '/logo-panel-tight.jpg',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/sirena.wav',
  '/sirena-wail.wav',
  '/sirena-horn.wav',
  '/sirena-pulse.wav',
  '/manifest.webmanifest',
  '/panel/manifest.webmanifest',
]

/** Best-effort SW audio — many OSes block it; clients still start the loud loop. */
let swAlertAudio = null

function soundUrlFor(sound, soundUrl) {
  if (typeof soundUrl === 'string' && soundUrl.startsWith('/sirena')) return soundUrl
  if (sound === 'horn') return '/sirena-horn.wav'
  if (sound === 'pulse') return '/sirena-pulse.wav'
  return '/sirena-wail.wav'
}

function tryPlayAlertInSw(sound, soundUrl) {
  // Never await this from the push handler — a hanging play() would block
  // showNotification and Chrome can drop the alert entirely.
  try {
    if (swAlertAudio) {
      try {
        swAlertAudio.pause()
      } catch {
        // ignore
      }
      swAlertAudio = null
    }
    const audio = new Audio(soundUrlFor(sound, soundUrl))
    audio.loop = true
    audio.volume = 1
    swAlertAudio = audio
    void audio.play().catch(() => {
      swAlertAudio = null
    })
  } catch {
    swAlertAudio = null
  }
}

function stopSwAlertAudio() {
  if (!swAlertAudio) return
  try {
    swAlertAudio.pause()
    swAlertAudio.currentTime = 0
  } catch {
    // ignore
  }
  swAlertAudio = null
}

function isAsset(url) {
  return /\.(?:jpe?g|png|svg|webp|gif|wav|webmanifest)$/i.test(url.pathname)
}

function looksLikeImage(res, pathname) {
  const ct = res.headers.get('content-type') || ''
  if (/\.(?:jpe?g|png|svg|webp|gif)$/i.test(pathname)) {
    return ct.startsWith('image/')
  }
  return res.ok
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL).catch(() => undefined)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  )
  self.clients.claim()
})

async function notifyClients(message) {
  const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  for (const client of list) {
    client.postMessage(message)
  }
  return list
}

async function readLastActivityMs() {
  try {
    const cache = await caches.open('rfs-meta')
    const res = await cache.match('/rfs-last-activity')
    if (!res) return 0
    const n = Number(await res.text())
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

async function showOverdueLocalNotification() {
  const last = await readLastActivityMs()
  if (!last || Date.now() - last < OVERDUE_MS) return
  await notifyClients({
    type: 'RFS_PUSH',
    kind: 'overdue-alert',
    title: '¡ALERTA RFS!',
    body: 'Lleva más de 2 horas sin ponche. Abra la app y ponche ahora.',
    url: '/',
    sound: 'pulse',
    soundUrl: '/sirena-pulse.wav',
  })
  await self.registration.showNotification('¡ALERTA RFS!', {
    body: 'Lleva más de 2 horas sin ponche. Abra la app y ponche ahora.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [800, 100, 800, 100, 1000, 100, 800],
    requireInteraction: true,
    renotify: true,
    tag: 'rfs-overdue-alert',
    silent: false,
    sound: '/sirena-pulse.wav',
    data: { url: '/', kind: 'overdue-alert', sound: 'pulse', soundUrl: '/sirena-pulse.wav' },
    actions: [
      { action: 'open', title: 'Abrir y ponchar' },
      { action: 'ack', title: 'Abrir app' },
    ],
  })
}

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || typeof data !== 'object') return
  if (data.type === 'RFS_ACTIVITY' && data.at) {
    const ms = new Date(data.at).getTime()
    if (!Number.isFinite(ms)) return
    event.waitUntil(
      caches.open('rfs-meta').then((cache) =>
        cache.put(
          '/rfs-last-activity',
          new Response(String(ms), { headers: { 'Content-Type': 'text/plain' } }),
        ),
      ),
    )
  }
})

self.addEventListener('periodicsync', (event) => {
  if (event.tag !== 'rfs-overdue-check') return
  event.waitUntil(showOverdueLocalNotification())
})

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      let data = {
        kind: 'remote-alert',
        title: '¡ALERTA RFS!',
        body: 'Central activa la sirena. Abra la app y ponche ahora.',
        url: '/',
        sound: 'wail',
        soundUrl: '/sirena-wail.wav',
      }
      try {
        if (event.data) data = { ...data, ...event.data.json() }
      } catch {
        try {
          const text = event.data?.text()
          if (text) data.body = text
        } catch {
          // keep defaults
        }
      }

      if (!data.sound) {
        data.sound = data.kind === 'overdue-alert' ? 'pulse' : 'wail'
      }
      data.soundUrl = soundUrlFor(data.sound, data.soundUrl)

      if (data.kind === 'remote-alert-stop') {
        stopSwAlertAudio()
        await notifyClients({ type: 'RFS_PUSH', ...data })
        await self.registration.getNotifications({ tag: 'rfs-remote-alert' }).then((notes) => {
          for (const n of notes) n.close()
        })
        await self.registration.getNotifications({ tag: 'rfs-overdue-alert' }).then((notes) => {
          for (const n of notes) n.close()
        })
        return
      }

      const kind = data.kind || 'remote-alert'
      const isOverdue = kind === 'overdue-alert'
      // Show the system notification FIRST — required for userVisibleOnly push.
      await self.registration.showNotification(data.title || '¡ALERTA RFS!', {
        body:
          data.body ||
          (isOverdue
            ? 'Lleva más de 2 horas sin ponche. Abra la app y ponche ahora.'
            : 'Central activa la sirena. Abra la app y ponche ahora.'),
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [800, 100, 800, 100, 1000, 100, 800, 100, 1200],
        requireInteraction: true,
        renotify: true,
        tag: isOverdue ? 'rfs-overdue-alert' : 'rfs-remote-alert',
        silent: false,
        sound: data.soundUrl,
        data: {
          url: data.url || '/',
          kind,
          sound: data.sound,
          soundUrl: data.soundUrl,
        },
        actions: [
          { action: 'open', title: 'Abrir y ponchar' },
          { action: 'ack', title: 'Abrir app' },
        ],
      })

      // Wake open app tabs (best-effort) after the notification is up.
      const clients = await notifyClients({ type: 'RFS_PUSH', ...data })
      if (!clients.length) {
        tryPlayAlertInSw(data.sound, data.soundUrl)
      }
    })(),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = event.notification.data?.url || '/'
  const kind = event.notification.data?.kind || 'remote-alert'
  const sound = event.notification.data?.sound || (kind === 'overdue-alert' ? 'pulse' : 'wail')
  const soundUrl = event.notification.data?.soundUrl || soundUrlFor(sound)
  event.waitUntil(
    (async () => {
      stopSwAlertAudio()
      const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of list) {
        if ('focus' in client) {
          await client.focus()
          client.postMessage({
            type: 'RFS_PUSH',
            kind,
            url: target,
            sound,
            soundUrl,
          })
          return
        }
      }
      if (self.clients.openWindow) {
        const win = await self.clients.openWindow(target)
        if (win) {
          // Give the page a moment to boot, then deliver the alert payload.
          await new Promise((r) => setTimeout(r, 900))
          try {
            win.postMessage({
              type: 'RFS_PUSH',
              kind,
              url: target,
              sound,
              soundUrl,
            })
          } catch {
            // page will also poll /signal
          }
        }
      }
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  const isDoc = req.mode === 'navigate' || req.destination === 'document'
  const isCode =
    req.destination === 'script' ||
    req.destination === 'style' ||
    url.pathname.startsWith('/assets/')

  if (isDoc || isCode) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.status === 200) {
            const copy = res.clone()
            void caches.open(CACHE).then((cache) => cache.put(req, copy).catch(() => undefined))
          }
          return res
        })
        .catch(() => caches.match(req)),
    )
    return
  }

  if (isAsset(url)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.status === 200 && looksLikeImage(res, url.pathname)) {
            const copy = res.clone()
            void caches.open(CACHE).then((cache) => cache.put(req, copy).catch(() => undefined))
          }
          return res
        })
        .catch(() => caches.match(req)),
    )
    return
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res.status === 200) {
            const copy = res.clone()
            void caches.open(CACHE).then((cache) => cache.put(req, copy).catch(() => undefined))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
