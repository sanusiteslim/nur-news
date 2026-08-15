import { groq } from 'next-sanity'

export interface CandidateProfile {
  partyCode: string
  partyName: string
  partyFlagUrl?: string
  name: string
  color: string
  imageUrl?: string
}

export interface ElectionProfile {
  title: string
  subtitle?: string
  slug: { current: string }
  candidates: CandidateProfile[]
  updates?: {
    timestamp: string
    text: string
    isBreaking: boolean
  }[]
}

export interface LGAResult {
  votes: Record<string, number>
  totalVotes: number
  reportingPercent: number
}

export interface ElectionResults {
  title: string
  subtitle?: string
  totalVotes: number
  reportingPercent: number
  lastUpdated: number
  candidates: {
    partyCode: string
    name: string
    color: string
    imageUrl?: string
    votes: number
    percentage: number
  }[]
  updates?: ElectionProfile['updates']
  lgas?: Record<string, LGAResult>
}



export const electionProfileQuery = groq`
  *[_type == "election" && slug.current == $slug][0] {
    title,
    subtitle,
    slug,
    candidates[] {
      partyCode,
      partyName,
      "partyFlagUrl": partyFlag.asset->url,
      name,
      color,
      "imageUrl": image.asset->url
    },
    updates[] {
      timestamp,
      text,
      isBreaking
    }
  }
`
// All 30 Osun LGAs
export const OSUN_LGAS = [
  'Aiyedaade', 'Aiyedire', 'Atakumosa East', 'Atakumosa West', 'Boluwaduro',
  'Boripe', 'Ede North', 'Ede South', 'Egbedore', 'Ejigbo', 'Ife Central',
  'Ife East', 'Ife North', 'Ife South', 'Ifedayo', 'Ifelodun', 'Ila',
  'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo',
  'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo',
]