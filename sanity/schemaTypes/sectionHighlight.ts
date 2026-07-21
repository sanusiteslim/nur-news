export default {
  name: 'sectionHighlight',
  title: 'Section: Highlight (2-Column)',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Section Title',
      type: 'string',
      initialValue: 'Latest',
    },
    {
      name: 'featured',
      title: 'Featured Article',
      type: 'reference',
      to: [{ type: 'article' }],
    },
    {
      name: 'list',
      title: 'List Articles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      validation: (Rule: any) => Rule.max(4),
    },
  ],
  preview: {
    select: { title: 'title' },
  },
}