import { defineField, defineType } from 'sanity'

/**
 * Optional search/social overrides. Every field falls back to the document's
 * own headline / excerpt / image when left empty, so this never has to be
 * filled in — it's there for the stories where a sharper search title helps.
 */
export default defineType({
  name: 'seo',
  title: 'SEO & sharing',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Search title',
      type: 'string',
      description: 'Shown in Google results. Leave empty to use the headline. Aim for under 60 characters.',
      validation: (Rule) => Rule.max(70).warning('Google usually cuts titles after ~60 characters.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Search description',
      type: 'text',
      rows: 2,
      description: 'Leave empty to use the excerpt. Aim for 120–160 characters.',
      validation: (Rule) => Rule.max(170).warning('Google usually cuts descriptions after ~160 characters.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description: 'Optional. Overrides the auto-generated share card (1200×630).',
    }),
    defineField({
      name: 'noindex',
      title: 'Hide from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
