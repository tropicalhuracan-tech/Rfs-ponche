import webpush from 'web-push'

export function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  const privateKey = process.env.VAPID_PRIVATE_KEY || ''
  const subject = process.env.VAPID_SUBJECT || 'mailto:central@rfs.local'
  if (publicKey && privateKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey)
  }
  return { publicKey }
}

export async function sendGuardPush(
  subscription: unknown,
  payload: Record<string, unknown>,
) {
  configureWebPush()
  if (!subscription) return { ok: false as const, reason: 'no-subscription' }
  try {
    await webpush.sendNotification(subscription as webpush.PushSubscription, JSON.stringify(payload))
    return { ok: true as const }
  } catch {
    return { ok: false as const, reason: 'send-failed' }
  }
}
