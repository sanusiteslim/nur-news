import 'server-only'
import fs from 'fs/promises'
import path from 'path'
import { Redis } from '@upstash/redis'
import type { PushSubscriptionRecord } from './types'

export interface PushSubscriberStore {
  add(sub: PushSubscriptionRecord): Promise<void>
  remove(endpoint: string): Promise<void>
  all(): Promise<PushSubscriptionRecord[]>
}

// --- Dev adapter: stores subscriptions as JSON on disk. ---------------------
// Local dev only. Vercel's serverless functions have a READ-ONLY filesystem
// outside of /tmp — this throws (EROFS) if it ever runs in production, which
// is exactly why getSubscriberStore() below only picks this when the Upstash
// env vars are absent.
const DATA_DIR = path.join(process.cwd(), '.data')
const DATA_FILE = path.join(DATA_DIR, 'push-subscribers.json')

class FileSubscriberStore implements PushSubscriberStore {
  private async read(): Promise<PushSubscriptionRecord[]> {
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf-8')
      return JSON.parse(raw)
    } catch {
      return []
    }
  }

  private async write(subs: PushSubscriptionRecord[]) {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify(subs, null, 2))
  }

  async add(sub: PushSubscriptionRecord) {
    const subs = await this.read()
    const filtered = subs.filter((s) => s.endpoint !== sub.endpoint)
    filtered.push(sub)
    await this.write(filtered)
  }

  async remove(endpoint: string) {
    const subs = await this.read()
    await this.write(subs.filter((s) => s.endpoint !== endpoint))
  }

  async all() {
    return this.read()
  }
}

// --- Production adapter: Upstash Redis. -------------------------------------
// Picked automatically whenever UPSTASH_REDIS_REST_URL / _TOKEN are set
// (Vercel env vars, or the Vercel↔Upstash marketplace integration).
class UpstashSubscriberStore implements PushSubscriberStore {
  private redis = Redis.fromEnv()
  private KEY = 'push:subscribers'

  async add(sub: PushSubscriptionRecord) {
    await this.redis.hset(this.KEY, { [sub.endpoint]: JSON.stringify(sub) })
  }

  async remove(endpoint: string) {
    await this.redis.hdel(this.KEY, endpoint)
  }

  async all() {
    const map = (await this.redis.hgetall<Record<string, string>>(this.KEY)) || {}
    return Object.values(map).map((v) => (typeof v === 'string' ? JSON.parse(v) : v))
  }
}

let cachedStore: PushSubscriberStore | null = null

export function getSubscriberStore(): PushSubscriberStore {
  if (cachedStore) return cachedStore

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    cachedStore = new UpstashSubscriberStore()
  } else {
    cachedStore = new FileSubscriberStore()
  }

  return cachedStore
}