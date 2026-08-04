export interface PushSubscriptionRecord {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  createdAt: string
}

export interface NotificationPayload {
  title: string
  body: string
  url: string
  image?: string
}