import { client, homepageQuery, breakingNewsQuery } from '@/lib/sanity'
import HeroSection from '@/components/sections/HeroSection'
import BreakingBanner from '@/components/sections/BreakingBanner'
import LiveUpdates from '@/components/sections/LiveUpdates'
import SectionHighlight from '@/components/sections/SectionHighlight'
import SectionGrid from '@/components/sections/SectionGrid'
import SectionOpinion from '@/components/sections/SectionOpinion'

export const revalidate = 5

export default async function HomePage() {
  const [homepage, breaking] = await Promise.all([
    client.fetch(homepageQuery),
    client.fetch(breakingNewsQuery),
  ])

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

      {homepage?.opinionSection && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <SectionOpinion data={homepage.opinionSection} />
        </section>
      )}
    </div>
  )
}