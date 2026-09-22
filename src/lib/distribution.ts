export type DistributionArticle = {
  headline: string
  excerpt?: string | null
  slug: {
    current: string
  }
  category?: string | null
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://www.nurreport.name.ng'

function articleUrl(article: DistributionArticle) {
  return `${SITE_URL}/${article.category || 'news'}/${article.slug.current}`
}

export function createArticleDistributionText(
  article: DistributionArticle
) {
  const url = articleUrl(article)

  return `🚨 NUR REPORT

${article.headline}

${article.excerpt || ''}

Read the full story:
${url}

#NURReport`
}

export function createBriefDistributionText(brief: {
  title: string
  intro?: string | null
  slug: {
    current: string
  }
}) {
  const url = `${SITE_URL}/brief/${brief.slug.current}`

  return `📰 NUR REPORT BRIEF

${brief.title}

${brief.intro || 'The most important stories from NUR Report.'}

Read today's Brief:
${url}

#NUR Report #News`
}