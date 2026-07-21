export default {
  name: 'sectionVideo',
  title: 'Section: Video Grid',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Section Title',
      type: 'string',
      initialValue: 'Video',
    },
    {
      name: 'videos',
      title: 'Video Articles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      validation: (Rule: any) => Rule.max(4),
    },
  ],
  preview: {
    select: { title: 'title' },
  },
}