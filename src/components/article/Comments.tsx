import { formatDistanceToNow } from 'date-fns'
import CommentForm from './CommentForm'

interface CommentItem {
  _id: string
  name: string
  body: string
  submittedAt: string
}

export default function Comments({ articleId, comments }: { articleId: string; comments: CommentItem[] }) {
  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-700" />
        Comments {comments.length > 0 && <span className="text-text-muted font-normal">({comments.length})</span>}
      </h2>

      <CommentForm articleId={articleId} />

      {comments.length === 0 ? (
        <p className="text-text-muted text-sm mt-8">Be the first to comment.</p>
      ) : (
        <div className="mt-8 space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="border-l-4 border-gray-200 pl-4 py-1">
              <div className="flex items-baseline gap-2">
                <p className="font-semibold text-text-primary text-sm">{comment.name}</p>
                <p className="text-xs text-text-muted">
                  {comment.submittedAt ? formatDistanceToNow(new Date(comment.submittedAt), { addSuffix: true }) : ''}
                </p>
              </div>
              <p className="text-text-secondary mt-1 whitespace-pre-wrap">{comment.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}