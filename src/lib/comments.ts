export interface RawComment {
  _id: string
  name: string
  body: string
  submittedAt: string
  likes: number
  parentId?: string
}

export interface ThreadedComment extends RawComment {
  replies: ThreadedComment[]
}

export function buildCommentTree(comments: RawComment[]): ThreadedComment[] {
  const map = new Map<string, ThreadedComment>()
  const roots: ThreadedComment[] = []

  for (const c of comments) {
    map.set(c._id, { ...c, replies: [] })
  }

  for (const c of comments) {
    const node = map.get(c._id)!
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}