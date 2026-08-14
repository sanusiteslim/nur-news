'use client'

import { useState } from 'react'
import CommentForm from './CommentForm'
import CommentItem from './CommentItem'

export interface CommentItemData {
  _id: string
  name: string
  body: string
  submittedAt: string
  likes?: number
  replies?: CommentItemData[]
}

interface CommentsProps {
  articleId: string
  comments: CommentItemData[]
}

export default function Comments({ articleId, comments }: CommentsProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  return (
    <section className="mt-10 sm:mt-14 scroll-mt-20" id="comments">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-brand-700" />
          <h2 className="text-lg sm:text-xl font-bold text-text-primary">
            Discussion
          </h2>
          {comments.length > 0 && (
            <span className="text-sm text-text-muted font-normal">
              {comments.length}
            </span>
          )}
        </div>
        {comments.length > 0 && (
          <button
            onClick={() =>
              document
                .getElementById('comment-form')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            className="text-sm font-medium text-brand-700 hover:text-brand-800 underline underline-offset-2"
          >
            Jump to reply
          </button>
        )}
      </div>

      {/* Form Wrapper */}
      <div
        id="comment-form"
        className="bg-surface-offwhite rounded-xl p-4 sm:p-6 border border-gray-100"
      >
        <CommentForm articleId={articleId} />
      </div>

      {/* Comments List */}
      <div className="mt-8 sm:mt-10">
        {comments.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
            <p className="text-text-muted text-sm sm:text-base">
              No comments yet. Start the conversation.
            </p>
          </div>
        ) : (
          <ul className="space-y-6 sm:space-y-8">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                articleId={articleId}
                replyingTo={replyingTo}
                onReplyClick={setReplyingTo}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}