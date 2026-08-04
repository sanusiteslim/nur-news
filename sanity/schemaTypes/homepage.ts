export default {
  name: 'homepage',
  title: 'Homepage Layout',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Homepage',
      readOnly: true,
    },
    {
      name: 'heroStory',
      title: 'Hero Story',
      type: 'reference',
      to: [{ type: 'article' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'sidebarStories',
      title: 'Sidebar Stories',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'sidebarStoryItem',
          title: 'Sidebar Story',
          fields: [
            {
              name: 'label',
              title: 'Section Label',
              description: 'Shown above the headline, e.g. "World Cup 2026", "Must Read", "Trending"',
              type: 'string',
              initialValue: 'Latest',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'story',
              title: 'Article',
              type: 'reference',
              to: [{ type: 'article' }],
              validation: (Rule: any) => Rule.required(),
            },
          ],
          preview: {
            select: { label: 'label', headline: 'story.headline' },
            prepare({ label, headline }: any) {
              return { title: headline || 'No article selected', subtitle: label }
            },
          },
        },
      ],
      validation: (Rule: any) => Rule.max(5),
    },
    {
      name: 'showLiveUpdates',
      title: 'Show Live Updates',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'liveUpdatesSource',
      title: 'Live Updates Source',
      type: 'reference',
      to: [{ type: 'article' }],
      hidden: ({ parent }: any) => !parent?.showLiveUpdates,
    },
    {
      name: 'highlightSection',
      title: 'Highlight Section (2-Column)',
      type: 'object',
      fields: [
        { name: 'title', title: 'Section Title', type: 'string', initialValue: 'Latest' },
        { name: 'featured', title: 'Featured Article', type: 'reference', to: [{ type: 'article' }] },
        { name: 'list', title: 'List Articles', type: 'array', of: [{ type: 'reference', to: [{ type: 'article' }] }], validation: (Rule: any) => Rule.max(4) },
      ],
    },
    {
      name: 'gridSection',
      title: 'Grid Section (3-Column Cards)',
      type: 'object',
      fields: [
        { name: 'title', title: 'Section Title', type: 'string', initialValue: 'More Stories' },
        { name: 'category', title: 'Filter by Category', type: 'string', options: { list: [{ title: 'Sports', value: 'sports' }, { title: 'Nigeria', value: 'nigeria' }, { title: 'Africa', value: 'africa' }, { title: 'World', value: 'world' }] } },
        { name: 'count', title: 'Number of Articles', type: 'number', initialValue: 6, validation: (Rule: any) => Rule.min(3).max(9) },
      ],
    },
    {
      name: 'opinionSection',
      title: 'Opinion Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Section Title', type: 'string', initialValue: 'Opinion' },
        { name: 'count', title: 'Number of Articles', type: 'number', initialValue: 4, validation: (Rule: any) => Rule.min(2).max(6) },
      ],
    },
  ],
  preview: {
    select: { title: 'title' },
  },
}