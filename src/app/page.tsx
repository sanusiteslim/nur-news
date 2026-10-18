import { client, homepageQuery, breakingNewsQuery } from '@/lib/sanity'
import { dedupeHomepage } from '@/lib/homepageDedup'
import HeroSection from '@/components/sections/HeroSection'
import BreakingBanner from '@/components/sections/BreakingBanner'
import LiveUpdates from '@/components/sections/LiveUpdates'
import SectionHighlight from '@/components/sections/SectionHighlight'
import SectionGrid from '@/components/sections/SectionGrid'
import SectionOpinion from '@/components/sections/SectionOpinion'
import MostRead from '@/components/sections/MostRead'
import TopicsStrip from '@/components/sections/TopicsStrip'
import NewsletterSignup from '@/components/opinion/NewsletterSignup'

export const revalidate = 60

export default async function HomePage() {
  const [rawHomepage, breaking] = await Promise.all([
    client.fetch(homepageQuery),
    client.fetch(breakingNewsQuery),
  ])

  const homepage = dedupeHomepage(rawHomepage)

  return (
    <div className="min-h-screen">
      {breaking && <BreakingBanner article={breaking} />}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HeroSection heroStory={homepage?.heroStory} sidebarStories={homepage?.sidebarStories || []} />
      </section>

      {homepage?.showLiveUpdates && homepage?.liveUpdatesSource && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <LiveUpdates source={homepage.liveUpdatesSource} />
        </section>
      )}

      {homepage?.highlightSection && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <SectionHighlight data={homepage.highlightSection} />
        </section>
      )}

      {homepage?.gridSection && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <SectionGrid data={homepage.gridSection} />
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <MostRead />
      </section>

      {homepage?.opinionSection && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <SectionOpinion data={homepage.opinionSection} />
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <TopicsStrip />
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex justify-center">
        <NewsletterSignup variant="inline" source="homepage" />
      </section>
    </div>
  )
}