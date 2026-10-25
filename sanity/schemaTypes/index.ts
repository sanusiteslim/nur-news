import article from './article'
import author from './author'
import { brief } from './brief'
import comment from './comment'
import election from './election'
import homepage from './homepage'
import liveEvent from './liveEvent'
import liveUpdate from './liveUpdate'
import sectionGrid from './sectionGrid'
import sectionHighlight from './sectionHighlight'
import sectionOpinion from './sectionOpinion'
import sectionVideo from './sectionVideo'
import seo from './seo'
import tipSubmission from './tipSubmission'
import topic from './topic'
import { richContentTypes } from './richContent'

// `comment` stays registered so existing documents keep opening in Studio;
// it's simply not surfaced in the desk structure.
export const schemaTypes = [
  article, author, homepage, tipSubmission, comment, election,
  sectionHighlight, sectionGrid, sectionOpinion, sectionVideo, liveUpdate, brief,
  seo, topic, liveEvent,
  ...richContentTypes,
]
