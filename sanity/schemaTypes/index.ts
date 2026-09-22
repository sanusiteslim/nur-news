import article from './article'
import author from './author'
import { brief } from './brief'
import comment from './comment'
import election from './election'
import homepage from './homepage'
import liveUpdate from './liveUpdate'
import sectionGrid from './sectionGrid'
import sectionHighlight from './sectionHighlight'
import sectionOpinion from './sectionOpinion'
import sectionVideo from './sectionVideo'
import tipSubmission from './tipSubmission'

// NOTE: `comment` was previously imported from 'postcss' by an editor
// auto-import — which meant comment.ts was never registered and the whole
// comment feature was dead in Studio. Fixed to import from './comment'.
export const schemaTypes = [
  article, author, homepage, tipSubmission, comment, election,
  sectionHighlight, sectionGrid, sectionOpinion, sectionVideo, liveUpdate, brief,
]
