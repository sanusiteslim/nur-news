import { config } from 'dotenv'
config({ path: '.env.local' })
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

async function check() {
  const slug = 'osun-2026-governorship'
  
  // Check statewide
  const state = await redis.hgetall(`election:${slug}`)
  console.log('Statewide:', state)
  
  // Check LGAs
  const lgas = await redis.hgetall(`election:${slug}:lgas`)
  console.log('LGAs raw:', lgas)
  
  // Parse one LGA
  if (lgas && lgas['Ede South']) {
    console.log('Ede South parsed:', JSON.parse(lgas['Ede South']))
  } else {
    console.log('Ede South NOT FOUND in Redis')
    console.log('Available keys:', Object.keys(lgas || {}))
  }
}

check()