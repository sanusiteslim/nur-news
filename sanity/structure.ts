import type { StructureResolver } from 'sanity/structure'

// Grouped desk so a small team can find things fast. Types not listed here
// (section blocks, legacy liveUpdate/comment) stay registered but hidden.
const articleList = (S: any, title: string, filter: string, params: Record<string, unknown> = {}) =>
  S.listItem()
    .title(title)
    .child(
      S.documentList()
        .title(title)
        .schemaType('article')
        .filter(`_type == "article" && ${filter}`)
        .params(params)
        .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
    )

export const structure: StructureResolver = (S) =>
  S.list()
    .title('NUR Report')
    .items([
      S.listItem()
        .title('Newsroom')
        .child(
          S.list()
            .title('Newsroom')
            .items([
              S.documentTypeListItem('article').title('All articles'),
              S.divider(),
              articleList(S, 'Published', 'status == "published"'),
              articleList(S, 'Drafts', '(status == "draft" || !defined(status))'),
              articleList(S, 'Scheduled', 'status == "scheduled"'),
              articleList(S, 'Breaking', 'isBreaking == true'),
              articleList(S, 'With corrections', 'count(corrections) > 0'),
            ])
        ),
      S.divider(),
      S.listItem()
        .title('Live')
        .child(
          S.list()
            .title('Live')
            .items([
              S.listItem()
                .title('🔴 Live now')
                .child(S.documentList().title('Live now').schemaType('liveEvent').filter('_type == "liveEvent" && status == "live"')),
              S.documentTypeListItem('liveEvent').title('All live events'),
              S.documentTypeListItem('election').title('Elections'),
            ])
        ),
      S.documentTypeListItem('topic').title('Topic hubs'),
      S.listItem()
        .title('Newsletter')
        .child(
          S.list()
            .title('Newsletter')
            .items([
              S.listItem()
                .title('Daily Brief')
                .child(S.documentList().title('Daily Brief').schemaType('brief').filter('_type == "brief" && (list == "daily" || !defined(list))')),
              S.listItem()
                .title('Weekend Digest')
                .child(S.documentList().title('Weekend Digest').schemaType('brief').filter('_type == "brief" && list == "weekly"')),
            ])
        ),
      S.divider(),
      S.documentTypeListItem('homepage').title('Homepage'),
      S.documentTypeListItem('author').title('Authors'),
      S.divider(),
      S.listItem()
        .title('Tips inbox')
        .child(S.documentList().title('Tips').schemaType('tipSubmission').filter('_type == "tipSubmission"').defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])),
    ])
