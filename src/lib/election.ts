import { groq } from 'next-sanity'

export interface CandidateProfile {
  partyCode: string
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
}

export const electionProfileQuery = groq`
  *[_type == "election" && slug.current == $slug][0] {
    title,
    subtitle,
    slug,
    candidates[] {
      partyCode,
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