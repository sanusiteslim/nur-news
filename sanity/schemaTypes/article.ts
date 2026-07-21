export default {
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    {
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (Rule: any) => Rule.required().max(120),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'headline', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule: any) => Rule.max(200),
    },
    {
      name: 'category',
      title: 'Category',
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
        ],
        layout: 'radio',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Breaking', value: 'breaking' },
          { title: 'Politics', value: 'politics' },
          { title: 'Economy', value: 'economy' },
          { title: 'Football', value: 'football' },
          { title: 'AFCON', value: 'afcon' },
          { title: 'Election', value: 'election' },
          { title: 'Climate', value: 'climate' },
          { title: 'Security', value: 'security' },
        ],
      },
    },
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule: any) => Rule.required() },
        { name: 'caption', title: 'Caption', type: 'string' },
      ],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt Text' },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        },
      ],
    },
    {
      name: 'isBreaking',
      title: 'Breaking News?',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'hasLiveUpdates',
      title: 'Live Updates?',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'liveUpdates',
      title: 'Live Updates',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'timestamp', type: 'datetime', title: 'Timestamp', validation: (Rule: any) => Rule.required() },
          { name: 'updateText', type: 'text', rows: 2, title: 'Update', validation: (Rule: any) => Rule.required() },
        ],
      }],
      hidden: ({ document }: any) => !document?.hasLiveUpdates,
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
          { title: 'Scheduled', value: 'scheduled' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
    },
  ],
  preview: {
    select: { title: 'headline', subtitle: 'category', media: 'featuredImage' },
  },
}