import { comment } from 'postcss'
import article from './article'
import author from './author'
import election from './election'
import homepage from './homepage'
import liveUpdate from './liveUpdate'
import sectionGrid from './sectionGrid'
import sectionHighlight from './sectionHighlight'
import sectionOpinion from './sectionOpinion'
import sectionVideo from './sectionVideo'
import tipSubmission from './tipSubmission'

export const schemaTypes = [
  article, author, homepage, tipSubmission, election,
  sectionHighlight, sectionGrid, sectionOpinion, sectionVideo, liveUpdate,
]