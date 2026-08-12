export default {
  name: 'comment',
  title: 'Comment',
  type: 'document',
  // Comments are created as drafts by the public form (see /api/comments).
  // Publishing a comment in Studio IS the moderation approval — the live
  // site's read client only ever sees published documents, so nothing
  // reaches the site until an editor publishes it here.
  fields: [
    {
      name: 'article',
      title: 'Article',
      type: 'reference',
      to: [{ type: 'article' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required().max(80),
    },
    {
      name: 'body',
      title: 'Comment',
      type: 'text',
      rows: 4,
      validation: (Rule: any) => Rule.required().max(1000),
    },
    {
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      readOnly: true,
    },
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'body', article: 'article.headline' },
    prepare({ title, subtitle, article }: any) {
      return {
        title: `${title}${article ? ` on "${article}"` : ''}`,
        subtitle: subtitle?.slice(0, 80),
      }
    },
  },
}