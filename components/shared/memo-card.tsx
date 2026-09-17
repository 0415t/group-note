'use client'

import { Heart, MessageCircle, ImageIcon, Paperclip } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Avatar, RatingStars, TagChip } from './primitives'
import { cn } from '@/lib/utils'
import type { Memo, Template } from '@/lib/types'
import { formatRelative } from '@/lib/format'

function valueToText(v: unknown): string {
  if (v == null || v === '') return ''
  if (Array.isArray(v)) return v.join('・')
  return String(v)
}

export function MemoCard({ memo, template }: { memo: Memo; template: Template }) {
  const { navigate, getUser, tags, favorites } = useStore()
  const author = getUser(memo.createdBy)
  const memoTags = tags.filter((t) => memo.tagIds.includes(t.id))
  const image = memo.attachments.find((a) => a.kind === 'image')
  const fileCount = memo.attachments.filter((a) => a.kind === 'pdf').length
  const imageCount = memo.attachments.filter((a) => a.kind === 'image').length
  const isFav = favorites.includes(memo.id)

  const ratingField = template.fields.find((f) => f.type === 'rating')
  const rating = ratingField ? Number(memo.values[ratingField.id] ?? 0) : 0

  // 一覧表示対象フィールド（評価・店名は個別表示するので除外）
  const listFields = template.fields.filter(
    (f) => f.visibleInList && f.type !== 'rating' && f.sortOrder !== 0,
  )

  return (
    <button
      type="button"
      onClick={() => navigate({ name: 'memoDetail', memoId: memo.id })}
      className="group flex w-full gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      {image ? (
        <img
          src={image.url || '/placeholder.svg'}
          alt=""
          className="h-20 w-20 shrink-0 rounded-xl object-cover"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
          {template.icon}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-bold text-foreground">{memo.title}</h3>
          {isFav && <Heart className="mt-0.5 size-4 shrink-0 fill-primary text-primary" />}
        </div>

        {rating > 0 && <RatingStars value={rating} size={13} className="mt-1" />}

        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          {listFields.map((f) => {
            const text = valueToText(memo.values[f.id])
            if (!text) return null
            return (
              <span key={f.id} className="truncate">
                {text}
              </span>
            )
          })}
        </div>

        {memoTags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {memoTags.slice(0, 3).map((t) => (
              <TagChip key={t.id} tag={t} small />
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Avatar user={author} size={16} />
            {author?.name}
          </span>
          <span>{formatRelative(memo.updatedAt)}</span>
          <span className="ml-auto flex items-center gap-2">
            {imageCount > 0 && (
              <span className="flex items-center gap-0.5">
                <ImageIcon className="size-3" />
                {imageCount}
              </span>
            )}
            {fileCount > 0 && (
              <span className="flex items-center gap-0.5">
                <Paperclip className="size-3" />
                {fileCount}
              </span>
            )}
            {memo.comments.length > 0 && (
              <span className={cn('flex items-center gap-0.5')}>
                <MessageCircle className="size-3" />
                {memo.comments.length}
              </span>
            )}
          </span>
        </div>
      </div>
    </button>
  )
}
