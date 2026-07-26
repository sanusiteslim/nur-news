export default {
  name: 'tipSubmission',
  title: 'Reader Tip',
  type: 'document',
  // Editors triage these manually — nothing here ever auto-publishes.
  fields: [
    {
      name: 'tipText',
      title: 'Tip',
      type: 'text',
      rows: 6,
      validation: (Rule: any) => Rule.required().max(2000),
    },
    {
      name: 'category',
      title: 'Suggested Category',
      type: 'string',
      options: {
        list: [
          { title: 'Nigeria', value: 'nigeria' },
          { title: 'Africa', value: 'africa' },
          { title: 'World', value: 'world' },
          { title: 'Sports', value: 'sports' },
          { title: 'Opinion', value: 'opinion' },
          { title: 'Business', value: 'business' },
          { title: 'Not sure', value: 'unsure' },
        ],
        layout: 'radio',
      },
      initialValue: 'unsure',
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Where this happened (state/LGA/area), if relevant',
    },
    {
      name: 'submitterName',
      title: 'Name',
      type: 'string',
      description: 'Optional — reader can submit anonymously',
    },
    {
      name: 'submitterContact',
      title: 'Contact (phone or email)',
      type: 'string',
      description: 'Optional — needed if you want to follow up for verification',
    },
    {
      name: 'attachmentNote',
      title: 'Attachment Note',
      type: 'string',
      description: 'If the tipper mentioned having photos/video, note it here for follow-up — the form itself does not accept file uploads',
      readOnly: true,
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Reviewing', value: 'reviewing' },
          { title: 'Actioned — became a story', value: 'actioned' },
          { title: 'Dismissed', value: 'dismissed' },
        ],
        layout: 'radio',
      },
      initialValue: 'new',
    },
    {
      name: 'editorNotes',
      title: 'Editor Notes',
      type: 'text',
      rows: 3,
      description: 'Internal only — verification notes, follow-up status, etc.',
    },
    {
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'source',
      title: 'Source',
      type: 'string',
      description: 'Where the tip came from (web form, WhatsApp, etc.)',
      initialValue: 'web',
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
    select: { title: 'tipText', subtitle: 'status', location: 'location' },
    prepare({ title, subtitle, location }: any) {
      return {
        title: title?.slice(0, 80) || '(empty tip)',
        subtitle: `${subtitle}${location ? ` · ${location}` : ''}`,
      }
    },
  },
}