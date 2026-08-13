import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'articleId',
      title: 'Article ID',
      type: 'string',
      description: 'The Sanity _id of the article this comment belongs to',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().max(80),
    }),

    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.email(),
    }),

    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().max(1000),
    }),

    defineField({
      name: 'parentId',
      title: 'Parent Comment ID',
      type: 'string',
      description: 'Set to the _id of the parent comment if this is a reply. Leave blank for top-level comments.',
      initialValue: '',
    }),

    defineField({
      name: 'likes',
      title: 'Likes',
      type: 'number',
      description: 'Number of upvotes',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),

    defineField({
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      description: 'Only approved comments appear on the site',
      initialValue: false,
    }),

    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),

    defineField({
      name: 'website',
      title: 'Website (Honeypot)',
      type: 'string',
      description: 'Spam trap — should always be empty',
      hidden: true,
      readOnly: true,
    }),

    defineField({
      name: 'ipAddress',
      title: 'IP Address',
      type: 'string',
      description: 'For moderation / rate-limiting',
      hidden: true,
      readOnly: true,
    }),
  ],

  preview: {
    select: {
      name: 'name',
      body: 'body',
      approved: 'approved',
      submittedAt: 'submittedAt',
    },
    prepare({ name, body, approved, submittedAt }) {
      const excerpt = body ? body.slice(0, 60) + (body.length > 60 ? '…' : '') : ''
      const status = approved ? '✅' : '⏳'
      const date = submittedAt
        ? new Date(submittedAt).toLocaleDateString('en-NG')
        : ''
      return {
        title: `${status} ${name || 'Anonymous'}`,
        subtitle: `${date} — ${excerpt}`,
      }
    },
  },

  orderings: [
    {
      title: 'Submitted At, Newest',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
    {
      title: 'Submitted At, Oldest',
      name: 'submittedAtAsc',
      by: [{ field: 'submittedAt', direction: 'asc' }],
    },
  ],
})