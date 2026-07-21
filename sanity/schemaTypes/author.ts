export default {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Editor-in-Chief', value: 'editor-in-chief' },
          { title: 'Managing Editor', value: 'managing-editor' },
          { title: 'Staff Writer', value: 'staff-writer' },
          { title: 'Contributor', value: 'contributor' },
          { title: 'Columnist', value: 'columnist' },
        ],
      },
    },
    { name: 'bio', title: 'Bio', type: 'text', rows: 4 },
    { name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } },
    { name: 'twitter', title: 'Twitter/X', type: 'url' },
    { name: 'email', title: 'Email', type: 'string' },
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
}