export default {
  name: 'sectionOpinion',
  title: 'Section: Opinion Row',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Section Title',
      type: 'string',
      initialValue: 'Opinion',
    },
    {
      name: 'count',
      title: 'Number of Articles',
      type: 'number',
      initialValue: 4,
      validation: (Rule: any) => Rule.min(2).max(6),
    },
  ],
  preview: {
    select: { title: 'title' },
  },
}