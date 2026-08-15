import { config } from 'dotenv'
import { Redis } from '@upstash/redis'

config({ path: '.env.local' })

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const parties = ['ACCORD', 'APC', 'PDP']
const lgas = [
  'aiyedaade', 'aiyedire', 'atakunmosa-east', 'atakunmosa-west', 'boluwaduro',
  'boripe', 'ede-north', 'ede-south', 'egbedore', 'ejigbo',
  'ife-central', 'ife-east', 'ife-north', 'ife-south', 'ifedayo',
  'ifelodun', 'ila', 'ilesa-east', 'ilesa-west', 'irepodun',
  'irewole', 'isokan', 'iwo', 'obokun', 'odo-otin',
  'ola-oluwa', 'olorunda', 'oriade', 'orolu', 'osogbo'
]

function randVotes() {
  return Math.floor(Math.random() * 15000) + 2000
}

async function seed() {
  const lgaData = {}

  for (const lga of lgas) {
    const candidates = {}
    let total = 0
    for (const p of parties) {
      const v = randVotes()
      candidates[p] = v
      total += v
    }
    lgaData[lga] = {
      totalVotes: total,
      reportingPercent: Math.floor(Math.random() * 40) + 60,
      candidates,
    }
  }

  await redis.set('election:osun-2026-governorship:lgas', JSON.stringify(lgaData))
  console.log('✅ Seeded 30 LGAs')
}

seed().catch(console.error)