export default {
  name: 'sectionGrid',
  title: 'Section: Grid (3-Column Cards)',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Section Title',
      type: 'string',
      initialValue: 'More Stories',
    },
    {
      name: 'category',
      title: 'Filter by Category',
      type: 'string',
      options: {
        list: [
          { title: 'Nigeria', value: 'nigeria' },
          { title: 'Africa', value: 'africa' },
          { title: 'US-Iran War', value: 'us-iran war' },
          { title: 'World', value: 'world' },
          { title: 'Sports', value: 'sports' },
          { title: 'Opinion', value: 'opinion' },
          { title: 'Business', value: 'business' },
          { title: 'Tech', value: 'tech' },  
        ],
      },
    },
    {
      name: 'count',
      title: 'Number of Articles',
      type: 'number',
      initialValue: 6,
      validation: (Rule: any) => Rule.min(3).max(9),
    },
  ],
  preview: {
    select: { title: 'title' },
  },
}