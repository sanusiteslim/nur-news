import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Topic hub — an evergreen landing page for a running story (Osun Election,
 * NELFUND, Naira, AFCON…). Collects every article carrying any of the listed
 * tags automatically, so it maintains itself once set up.
 */
export default defineType({
  name: 'topic',
  title: 'Topic hub',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required().max(80) }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 80 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'One-line summary',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'intro',
      title: 'Explainer',
      type: 'array',
      description: 'What this story is about, for a reader arriving cold. Keep it current.',
      of: [defineArrayMember({ type: 'block', styles: [{ title: 'Normal', value: 'normal' }, { title: 'Heading 3', value: 'h3' }] })],
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'tags',
      title: 'Article tags to collect',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Lowercase tag values, e.g. osun-2026, election. Any article carrying one of these appears on the hub.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'pinned',
      title: 'Pinned stories',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'article' }] })],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'timeline',
      title: 'Timeline',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'timelineEntry',
          fields: [
            defineField({ name: 'date', type: 'date', title: 'Date', validation: (Rule) => Rule.required() }),
            defineField({ name: 'text', type: 'string', title: 'What happened', validation: (Rule) => Rule.required() }),
            defineField({ name: 'article', type: 'reference', title: 'Related story', to: [{ type: 'article' }] }),
          ],
          preview: { select: { title: 'text', subtitle: 'date' } },
        }),
      ],
    }),
    defineField({
      name: 'faq',
      title: 'Questions readers ask',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({ name: 'question', type: 'string', title: 'Question', validation: (Rule) => Rule.required() }),
            defineField({ name: 'answer', type: 'text', rows: 3, title: 'Answer', validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'question' } },
        }),
      ],
    }),
    defineField({ name: 'isFeatured', title: 'Show on the Topics index', type: 'boolean', initialValue: true }),
    defineField({ name: 'seo', title: 'SEO & sharing', type: 'seo' }),
  ],
  preview: { select: { title: 'title', subtitle: 'summary', media: 'heroImage' } },
})
