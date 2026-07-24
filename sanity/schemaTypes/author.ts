// schemaTypes/author.ts
import {defineField, defineType} from 'sanity'

const NIGERIAN_STATES: string[] = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
  'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          {title: 'Editor-in-Chief', value: 'editor-in-chief'},
          {title: 'Managing Editor', value: 'managing-editor'},
          {title: 'Staff Writer', value: 'staff-writer'},
          {title: 'Contributor', value: 'contributor'},
          {title: 'Columnist', value: 'columnist'},
          {title: 'State-based Journalist', value: 'state-journalist'},
        ],
      },
      initialValue: 'staff-writer',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'state',
      title: 'State (only for state-based journalists)',
      type: 'string',
      options: {
        list: NIGERIAN_STATES.map((s) => ({title: s, value: s})),
      },
      hidden: ({parent}) => parent?.role !== 'state-journalist',
      validation: (Rule) =>
        Rule.custom((state, context) => {
          const parent = context.parent as {role?: string} | undefined
          if (parent?.role === 'state-journalist' && !state) {
            return 'Select a state for a state-based journalist.'
          }
          return true
        }),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'twitter',
      title: 'Twitter/X',
      type: 'url',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      name: 'name',
      role: 'role',
      state: 'state',
      media: 'photo',
    },
    prepare({name, role, state, media}) {
      let subtitle = role
      if (role === 'state-journalist' && state) {
        subtitle = `${state}-based journalist`
      }
      return {title: name, subtitle, media}
    },
  },
})