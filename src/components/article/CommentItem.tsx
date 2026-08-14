'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import CommentForm from './CommentForm'
import type { CommentItemData } from './Comments'

interface CommentItemProps {
  comment: CommentItemData
  articleId: string
  replyingTo: string | null
  onReplyClick: (id: string | null) => void
  isReply?: boolean
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function CommentItem({
  comment,
  articleId,
  replyingTo,
  onReplyClick,
  isReply = false,
}: CommentItemProps) {
  const [likes, setLikes] = useState(comment.likes || 0)
  const [userLiked, setUserLiked] = useState(false)
  const [userDisliked, setUserDisliked] = useState(false)
  const [isReporting, setIsReporting] = useState(false)

  const handleLike = async () => {
    if (userLiked) {
      setLikes((p) => p - 1)
      setUserLiked(false)
      return
    }

    setLikes((p) => p + 1)
    setUserLiked(true)
    if (userDisliked) setUserDisliked(false)

    // Persist to Sanity (fire-and-forget; UI already updated optimistically)
    try {
      await fetch('/api/comments/like', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: comment._id }),
      })
    } catch {
      // Silently fail; like already shown in UI
    }
  }

  const handleDislike = () => {
    if (userDisliked) {
      setUserDisliked(false)
    } else {
      setUserDisliked(true)
      if (userLiked) {
        setLikes((p) => p - 1)
        setUserLiked(false)
      }
    }
  }

  return (
    <li className={isReply ? 'ml-10 sm:ml-14 pl-4 sm:pl-6 border-l-2 border-gray-100' : ''}>
      <div className="flex gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs sm:text-sm font-bold select-none">
            {getInitials(comment.name)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-semibold text-text-primary text-sm">
              {comment.name}
            </span>
            <span className="text-xs text-text-muted">
              {comment.submittedAt
                ? formatDistanceToNow(new Date(comment.submittedAt), {
                    addSuffix: true,
                  })
                : ''}
            </span>
          </div>

          {/* Body */}
          <p className="mt-1.5 text-sm sm:text-[15px] text-text-secondary leading-relaxed break-words whitespace-pre-wrap">
            {comment.body}
          </p>

          {/* Actions */}
          <div className="mt-2.5 flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                userLiked
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-text-muted hover:bg-gray-100'
              }`}
              aria-label="Like comment"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              {likes > 0 && <span>{likes}</span>}
            </button>

            <button
              onClick={handleDislike}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                userDisliked
                  ? 'bg-red-50 text-red-600'
                  : 'text-text-muted hover:bg-gray-100'
              }`}
              aria-label="Dislike comment"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
              </svg>
            </button>

            <button
              onClick={() =>
                onReplyClick(replyingTo === comment._id ? null : comment._id)
              }
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                replyingTo === comment._id
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-text-muted hover:bg-gray-100'
              }`}
            >
              Reply
            </button>

            <button
              onClick={() => setIsReporting(!isReporting)}
              className="ml-auto px-2.5 py-1 rounded-full text-xs font-medium text-text-muted hover:text-accent-red hover:bg-red-50 transition-colors"
            >
              Report
            </button>
          </div>

          {/* Inline Reply Form */}
          {replyingTo === comment._id && (
            <div className="mt-3 bg-surface-offwhite rounded-lg p-3 sm:p-4 border border-gray-100">
              <p className="text-xs text-text-muted mb-2">
                Replying to <span className="font-medium text-text-primary">{comment.name}</span>
              </p>
              <CommentForm
                articleId={articleId}
                parentId={comment._id}
                onSuccess={() => onReplyClick(null)}
              />
            </div>
          )}

          {/* Report Confirmation */}
          {isReporting && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
              Thanks for letting us know. Our moderators will review this comment.
              <button
                onClick={() => setIsReporting(false)}
                className="ml-2 font-medium underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <ul className="mt-5 space-y-5">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  articleId={articleId}
                  replyingTo={replyingTo}
                  onReplyClick={onReplyClick}
                  isReply
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  )
}