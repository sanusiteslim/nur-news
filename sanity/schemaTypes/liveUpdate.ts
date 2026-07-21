export default {
  name: 'liveUpdate',
  title: 'Live Update',
  type: 'object',
  fields: [
    {
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'updateText',
      title: 'Update Text',
      type: 'text',
      rows: 2,
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'updateText',
      subtitle: 'timestamp',
    },
  },
}