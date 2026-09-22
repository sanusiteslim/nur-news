import { defineField, defineType } from 'sanity'

export const brief = defineType({
  name: 'brief',
  title: 'NUR Report Brief',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'NUR Report Brief',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'date',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'date',
      title: 'Brief Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'edition',
      title: 'Edition',
      type: 'string',
      options: {
        list: [
          { title: 'Evening Brief', value: 'evening' },
          { title: 'Morning Brief', value: 'morning' },
        ],
        layout: 'radio',
      },
      initialValue: 'evening',
    }),

    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'text',
      rows: 4,
      description: 'Short introduction displayed before the stories.',
    }),

    defineField({
      name: 'leadStory',
      title: 'Lead Story',
      type: 'reference',
      to: [{ type: 'article' }],
    }),

    defineField({
      name: 'nigeria',
      title: 'Nigeria',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'article' }],
        },
      ],
    }),

    defineField({
      name: 'business',
      title: 'Business',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'article' }],
        },
      ],
    }),

    defineField({
      name: 'tech',
      title: 'Tech',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'article' }],
        },
      ],
    }),

    defineField({
      name: 'sports',
      title: 'Sports',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'article' }],
        },
      ],
    }),

    defineField({
      name: 'world',
      title: 'World',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'article' }],
        },
      ],
    }),

    defineField({
      name: 'closing',
      title: 'Closing Note',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      date: 'date',
      edition: 'edition',
      status: 'status',
    },

    prepare({ title, date, edition, status }) {
      return {
        title: `${title} — ${date || ''}`,
        subtitle: `${edition || 'evening'} · ${status || 'draft'}`,
      }
    },
  },
})