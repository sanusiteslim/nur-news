// schemas/election.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'election',
  title: 'Election Profile',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Election Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'e.g., "Live Results · Updated every 2 minutes"',
    }),
    defineField({
      name: 'candidates',
      title: 'Candidates',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'partyCode',
              title: 'Party Code',
              type: 'string',
              description: 'Uppercase, e.g., APC, PDP, LP',
              validation: (Rule) => Rule.required().max(10),
            }),
            defineField({
              name: 'name',
              title: 'Candidate Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'color',
              title: 'Bar Color',
              type: 'string',
              description: 'Hex code, e.g., #2E7D32',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'image',
              title: 'Candidate Photo',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'partyCode' },
          },
        },
      ],
    }),
    defineField({
      name: 'updates',
      title: 'Live Updates',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'timestamp',
              title: 'Timestamp',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
            }),
            defineField({
              name: 'text',
              title: 'Update Text',
              type: 'string',
              validation: (Rule) => Rule.required().max(280),
            }),
            defineField({
              name: 'isBreaking',
              title: 'Breaking?',
              type: 'boolean',
              initialValue: false,
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
})
