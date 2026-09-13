// The homepage is manually curated in Sanity (editors pick the hero,
// sidebar stories, highlight section, etc. as separate fields on one
// singleton document), so nothing stops the same article being picked for
// two different slots. This runs after the fetch and removes an article
// from every section after the first (in on-page order) that claims it.
//
// Priority follows visual position top-to-bottom: hero wins any collision,
// then sidebar (in list order), then the highlight section's featured
// piece, then its list, then the grid, then opinion. A later section
// simply renders with one fewer item rather than erroring — every
// component already tolerates a shorter/empty array.
export function dedupeHomepage(homepage: any) {
  if (!homepage) return homepage

  const used = new Set<string>()

  // Returns true (and claims the slug) if this article hasn't appeared
  // in an earlier section yet; false if it's a duplicate to be dropped.
  const claim = (slug?: string | null): boolean => {
    if (!slug) return false
    if (used.has(slug)) return false
    used.add(slug)
    return true
  }

  const heroSlug = homepage.heroStory?.slug?.current
  if (heroSlug) used.add(heroSlug) // hero always keeps its slot

  const sidebarStories = (homepage.sidebarStories || []).filter((item: any) =>
    claim(item?.story?.slug?.current)
  )

  let highlightFeatured = homepage.highlightSection?.featured
  if (highlightFeatured && !claim(highlightFeatured.slug?.current)) {
    highlightFeatured = null
  }

  const highlightList = (homepage.highlightSection?.list || []).filter((a: any) =>
    claim(a?.slug?.current)
  )

  const gridArticles = (homepage.gridSection?.articles || []).filter((a: any) =>
    claim(a?.slug?.current)
  )

  const opinionArticles = (homepage.opinionSection?.articles || []).filter((a: any) =>
    claim(a?.slug?.current)
  )

  return {
    ...homepage,
    sidebarStories,
    highlightSection: homepage.highlightSection
      ? { ...homepage.highlightSection, featured: highlightFeatured, list: highlightList }
      : homepage.highlightSection,
    gridSection: homepage.gridSection
      ? { ...homepage.gridSection, articles: gridArticles }
      : homepage.gridSection,
    opinionSection: homepage.opinionSection
      ? { ...homepage.opinionSection, articles: opinionArticles }
      : homepage.opinionSection,
  }
}
