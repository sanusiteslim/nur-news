import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Extra blocks editors can drop into an article body (the "+" / insert menu
 * in the body editor). Each one has a matching renderer in
 * src/components/article/ArticleBodyBlocks.tsx — add both together.
 * No Studio plugins needed, so these work on any Sanity version.
 */

// ---- Table ---------------------------------------------------------------
// Two ways to fill it: type rows cell by cell, or paste CSV (e.g. copied from
// Excel/Google Sheets saved as CSV). Rows win when both are filled.
export const dataTable = defineType({
  name: 'dataTable',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({ name: 'caption', title: 'Title / caption', type: 'string' }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      description: 'One item per row. Inside each row, add one cell per column.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tableRow',
          title: 'Row',
          fields: [defineField({ name: 'cells', title: 'Cells', type: 'array', of: [defineArrayMember({ type: 'string' })] })],
          preview: {
            select: { cells: 'cells' },
            prepare({ cells }: any) {
              return { title: (cells || []).join('  |  ') || 'Empty row' }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'csv',
      title: '…or paste CSV',
      type: 'text',
      rows: 6,
      description: 'Comma-separated, one row per line. Used only when Rows above is empty.',
    }),
    defineField({ name: 'hasHeaderRow', title: 'First row is a header', type: 'boolean', initialValue: true }),
    defineField({ name: 'hasHeaderColumn', title: 'First column is a header', type: 'boolean', initialValue: false }),
    defineField({ name: 'source', title: 'Source', type: 'string', description: 'e.g. "Source: INEC, 2026"' }),
  ],
  preview: {
    select: { caption: 'caption', rows: 'rows', csv: 'csv' },
    prepare({ caption, rows, csv }: any) {
      const count = rows?.length || (csv ? String(csv).trim().split('\n').length : 0)
      return { title: caption || 'Table', subtitle: `${count} row${count === 1 ? '' : 's'}` }
    },
  },
})

// ---- Callout / info box ---------------------------------------------------
export const callout = defineType({
  name: 'callout',
  title: 'Callout box',
  type: 'object',
  fields: [
    defineField({
      name: 'tone',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          { title: 'Info (green)', value: 'info' },
          { title: 'Context / background (grey)', value: 'context' },
          { title: 'Warning (orange)', value: 'warning' },
          { title: 'Alert (red)', value: 'alert' },
        ],
        layout: 'radio',
      },
      initialValue: 'info',
    }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [{ title: 'Bullet', value: 'bullet' }, { title: 'Numbered', value: 'number' }],
          marks: {
            decorators: [{ title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }],
            annotations: [
              { name: 'link', type: 'object', title: 'URL', fields: [{ name: 'href', type: 'url', title: 'URL' }] },
            ],
          },
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', tone: 'tone' },
    prepare({ title, tone }: any) {
      return { title: title || 'Callout', subtitle: `Callout · ${tone || 'info'}` }
    },
  },
})

// ---- Key facts / "at a glance" list ----------------------------------------
export const keyFacts = defineType({
  name: 'keyFacts',
  title: 'Key facts',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'Key facts' }),
    defineField({
      name: 'items',
      title: 'Facts',
      type: 'array',
      of: [defineArrayMember({ type: 'text', rows: 2 })],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { title: 'title', items: 'items' },
    prepare({ title, items }: any) {
      return { title: title || 'Key facts', subtitle: `${items?.length || 0} facts` }
    },
  },
})

// ---- Pull quote --------------------------------------------------------------
export const pullQuote = defineType({
  name: 'pullQuote',
  title: 'Pull quote',
  type: 'object',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: (Rule) => Rule.required() }),
    defineField({ name: 'attribution', title: 'Who said it', type: 'string' }),
    defineField({ name: 'role', title: 'Their role', type: 'string' }),
  ],
  preview: {
    select: { title: 'quote', subtitle: 'attribution' },
  },
})

// ---- Embed (video & social posts) -------------------------------------------
export const embed = defineType({
  name: 'embed',
  title: 'Embed (YouTube, X, Instagram…)',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Link',
      type: 'url',
      description: 'YouTube, Vimeo, X/Twitter, Instagram, Facebook, TikTok or Spotify link.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
  ],
  preview: {
    select: { title: 'url', subtitle: 'caption' },
  },
})

// ---- Related story card -----------------------------------------------------
export const relatedStory = defineType({
  name: 'relatedStory',
  title: 'Related story',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', initialValue: 'Read more' }),
    defineField({
      name: 'story',
      title: 'Story',
      type: 'reference',
      to: [{ type: 'article' }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'story.headline', label: 'label' },
    prepare({ title, label }: any) {
      return { title: title || 'Related story', subtitle: label || 'Read more' }
    },
  },
})

// ---- Divider ---------------------------------------------------------------
export const divider = defineType({
  name: 'divider',
  title: 'Divider',
  type: 'object',
  fields: [
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      options: { list: [{ title: 'Line', value: 'line' }, { title: 'Three dots', value: 'dots' }], layout: 'radio' },
      initialValue: 'line',
    }),
  ],
  preview: {
    select: { style: 'style' },
    prepare({ style }: any) {
      return { title: style === 'dots' ? '• • •' : '──────', subtitle: 'Divider' }
    },
  },
})

export const richContentTypes = [dataTable, callout, keyFacts, pullQuote, embed, relatedStory, divider]
