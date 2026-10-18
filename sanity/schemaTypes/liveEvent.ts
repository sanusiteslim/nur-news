import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * A live page at /live/[slug]. Works for any running story — an election,
 * a budget speech, a match, a breaking incident. Posts are added in Studio
 * (newest at the top is fine; the site sorts by time).
 *
 * For elections, link the `election` document: the tallies keep coming from
 * Redis via the admin results screen, exactly as before.
 */
export default defineType({
  name: 'liveEvent',
  title: 'Live event',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required().max(110) }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Upcoming', value: 'upcoming' },
          { title: '🔴 Live now', value: 'live' },
          { title: 'Ended', value: 'ended' },
        ],
        layout: 'radio',
      },
      initialValue: 'live',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eventType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Election', value: 'election' },
          { title: 'Breaking news', value: 'breaking' },
          { title: 'Sports', value: 'sports' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'radio',
      },
      initialValue: 'breaking',
    }),
    defineField({
      name: 'election',
      title: 'Election results',
      type: 'reference',
      to: [{ type: 'election' }],
      hidden: ({ parent }) => parent?.eventType !== 'election',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Used for the share card colour and related coverage.',
      options: {
        list: ['nigeria', 'africa', 'world', 'sports', 'business', 'tech', 'culture', 'environment'].map((v) => ({
          title: v[0].toUpperCase() + v.slice(1),
          value: v,
        })),
      },
      initialValue: 'nigeria',
    }),
    defineField({
      name: 'summary',
      title: 'Standfirst',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required().max(220),
    }),
    defineField({
      name: 'keyPoints',
      title: 'Key points',
      type: 'array',
      description: '3–5 bullets on where things stand. Update as the story moves — late arrivals read this first.',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: 'heroImage',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'startAt', title: 'Starts', type: 'datetime', validation: (Rule) => Rule.required() }),
    defineField({ name: 'endAt', title: 'Ended', type: 'datetime' }),
    defineField({
      name: 'posts',
      title: 'Posts',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'livePost',
          fields: [
            defineField({
              name: 'publishedAt',
              title: 'Time',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'title', title: 'Heading (optional)', type: 'string' }),
            defineField({
              name: 'body',
              title: 'Update',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'block',
                  styles: [{ title: 'Normal', value: 'normal' }, { title: 'Quote', value: 'blockquote' }],
                  lists: [{ title: 'Bullet', value: 'bullet' }],
                  marks: {
                    decorators: [{ title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }],
                    annotations: [
                      { name: 'link', type: 'object', title: 'URL', fields: [{ name: 'href', type: 'url', title: 'URL' }] },
                    ],
                  },
                }),
                defineArrayMember({
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
                    defineField({ name: 'caption', type: 'string', title: 'Caption' }),
                  ],
                }),
              ],
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'isKey', title: 'Key event', type: 'boolean', initialValue: false }),
            defineField({ name: 'isBreaking', title: 'Breaking', type: 'boolean', initialValue: false }),
            defineField({ name: 'isPinned', title: 'Pin to top', type: 'boolean', initialValue: false }),
            defineField({ name: 'author', title: 'Posted by', type: 'reference', to: [{ type: 'author' }] }),
          ],
          preview: {
            select: { title: 'title', time: 'publishedAt', body: 'body', isKey: 'isKey', isPinned: 'isPinned' },
            prepare({ title, time, body, isKey, isPinned }: any) {
              const text = body?.find((b: any) => b._type === 'block')?.children?.map((c: any) => c.text).join('') || ''
              const flags = [isPinned && '📌', isKey && '⭐'].filter(Boolean).join(' ')
              return {
                title: `${flags} ${title || text.slice(0, 80) || 'Update'}`.trim(),
                subtitle: time ? new Date(time).toLocaleString() : '',
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'relatedTopic',
      title: 'Topic hub',
      type: 'reference',
      to: [{ type: 'topic' }],
    }),
    defineField({ name: 'seo', title: 'SEO & sharing', type: 'seo' }),
  ],
  orderings: [{ title: 'Newest', name: 'startDesc', by: [{ field: 'startAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', status: 'status', media: 'heroImage' },
    prepare({ title, status, media }: any) {
      const label = status === 'live' ? '🔴 LIVE' : status === 'upcoming' ? 'Upcoming' : 'Ended'
      return { title, subtitle: label, media }
    },
  },
})
