'use client'

import { useState } from 'react'
import {
  Heart,
  Pencil,
  FileText,
  Download,
  Send,
  History,
  Link as LinkIcon,
  Eye,
  Lock,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { ScreenHeader, Avatar, RatingStars, TagChip } from '@/components/shared/primitives'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDate, formatRelative, formatFileSize } from '@/lib/format'
import { REACTION_META, type ReactionType, type Memo, type Template, type TemplateField } from '@/lib/types'

const REACTION_ORDER: ReactionType[] = ['helpful', 'saved', 'wanna_go', 'checked', 'experienced']

export function MemoDetailScreen({ memoId }: { memoId: string }) {
  const store = useStore()
  const { getMemo, getTemplate, getUser, tags, favorites, toggleFavorite, toggleReaction, addComment, currentUserId, navigate } =
    store

  const memo = getMemo(memoId)
  const template = memo ? getTemplate(memo.templateId) : undefined
  const [comment, setComment] = useState('')

  if (!memo || !template) return null

  const author = getUser(memo.createdBy)
  const isFav = favorites.includes(memo.id)
  const memoTags = tags.filter((t) => memo.tagIds.includes(t.id))
  const images = memo.attachments.filter((a) => a.kind === 'image')
  const files = memo.attachments.filter((a) => a.kind === 'pdf')
  const canEdit = memo.createdBy === currentUserId

  const ratingField = template.fields.find((f) => f.type === 'rating')
  const rating = ratingField ? Number(memo.values[ratingField.id] ?? 0) : 0

  // 表示するフィールド（画像/ファイル/評価/タイトル用の店名は個別処理）
  const displayFields = template.fields
    .filter((f) => f.type !== 'rating' && f.type !== 'image' && f.type !== 'file' && f.sortOrder !== 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const reactionCount = (t: ReactionType) => memo.reactions.filter((r) => r.type === t).length
  const iReacted = (t: ReactionType) => memo.reactions.some((r) => r.userId === currentUserId && r.type === t)

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault()
    const body = comment.trim()
    if (!body) return
    addComment(memo.id, body)
    setComment('')
  }

  return (
    <div className="flex min-h-full flex-col pb-4">
      <ScreenHeader
        title={template.name}
        right={
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => toggleFavorite(memo.id)}
              aria-label="お気に入り"
            >
              <Heart className={cn('size-5', isFav ? 'fill-primary text-primary' : 'text-muted-foreground')} />
            </Button>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => navigate({ name: 'memoEdit', templateId: memo.templateId, memoId: memo.id })}
                aria-label="編集"
              >
                <Pencil className="size-4.5" />
              </Button>
            )}
          </div>
        }
      />

      {/* 画像ギャラリー */}
      {images.length > 0 && (
        <div className="flex snap-x gap-2 overflow-x-auto px-4 pt-4">
          {images.map((img) => (
            <img
              key={img.id}
              src={img.url || '/placeholder.svg'}
              alt={img.name}
              crossOrigin="anonymous"
              className={cn(
                'h-48 shrink-0 snap-start rounded-2xl object-cover',
                images.length === 1 ? 'w-full' : 'w-64',
              )}
            />
          ))}
        </div>
      )}

      <div className="px-4 pt-4">
        <h1 className="text-xl font-extrabold text-foreground text-balance">{memo.title}</h1>
        {rating > 0 && <RatingStars value={rating} size={18} className="mt-2" />}

        {/* 投稿者 */}
        <div className="mt-3 flex items-center gap-2 text-sm">
          <Avatar user={author} size={28} />
          <span className="font-medium text-foreground">{author?.name}</span>
          <span className="text-muted-foreground">・{formatRelative(memo.createdAt)}</span>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="size-3.5" />
            {memo.viewCount}
          </span>
        </div>

        {/* 公開範囲 */}
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          {memo.visibility === 'group' ? <Eye className="size-3.5" /> : <Lock className="size-3.5" />}
          {memo.visibility === 'group' ? 'グループ全員に公開' : '自分のみ'}
        </div>
      </div>

      {/* フィールド値 */}
      <dl className="mt-4 flex flex-col gap-px overflow-hidden rounded-2xl border border-border bg-border">
        {displayFields.map((f) => (
          <FieldRow key={f.id} field={f} memo={memo} />
        ))}
      </dl>

      {/* タグ */}
      {memoTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 px-4">
          {memoTags.map((t) => (
            <TagChip key={t.id} tag={t} />
          ))}
        </div>
      )}

      {/* 添付ファイル */}
      {files.length > 0 && (
        <div className="mt-4 px-4">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">添付ファイル</p>
          <div className="flex flex-col gap-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="ダウンロード">
                  <Download className="size-4.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* リアクション */}
      <div className="mt-5 px-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">リアクション</p>
        <div className="flex flex-wrap gap-2">
          {REACTION_ORDER.map((t) => {
            const count = reactionCount(t)
            const active = iReacted(t)
            return (
              <button
                key={t}
                onClick={() => toggleReaction(memo.id, t)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/40',
                )}
              >
                <span aria-hidden>{REACTION_META[t].emoji}</span>
                {REACTION_META[t].label}
                {count > 0 && <span className="font-bold">{count}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* コメント */}
      <div className="mt-6 px-4">
        <p className="mb-3 text-sm font-bold text-foreground">コメント {memo.comments.length}件</p>
        <div className="flex flex-col gap-3">
          {memo.comments.map((c) => {
            const u = getUser(c.userId)
            return (
              <div key={c.id} className="flex gap-2.5">
                <Avatar user={u} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-foreground">{u?.name}</span>
                    <span className="text-[11px] text-muted-foreground">{formatRelative(c.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 rounded-xl rounded-tl-sm bg-muted px-3 py-2 text-sm text-foreground text-pretty">
                    {c.body}
                  </p>
                </div>
              </div>
            )
          })}
          {memo.comments.length === 0 && (
            <p className="py-2 text-sm text-muted-foreground">まだコメントはありません。</p>
          )}
        </div>

        <form onSubmit={submitComment} className="mt-3 flex items-center gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="コメントを追加..."
            className="h-11 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-ring/30"
          />
          <Button type="submit" size="icon" className="size-11 shrink-0 rounded-full" disabled={!comment.trim()} aria-label="送信">
            <Send className="size-5" />
          </Button>
        </form>
      </div>

      {/* 更新履歴 */}
      <div className="mt-6 px-4">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <History className="size-4" /> 更新履歴
        </p>
        <ol className="flex flex-col gap-3 border-l border-border pl-4">
          {[...memo.activity].reverse().map((a) => {
            const u = getUser(a.userId)
            return (
              <li key={a.id} className="relative">
                <span className="absolute -left-[21px] top-1 size-2.5 rounded-full border-2 border-background bg-primary" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{u?.name}</span>さんが{a.detail}
                </p>
                <p className="text-[11px] text-muted-foreground">{formatDate(a.createdAt)}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

function FieldRow({ field, memo }: { field: TemplateField; memo: Memo }) {
  const raw = memo.values[field.id]
  if (raw == null || raw === '' || (Array.isArray(raw) && raw.length === 0)) return null

  let content: React.ReactNode
  if (field.type === 'url') {
    content = (
      <a href={String(raw)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
        <LinkIcon className="size-3.5" />
        参考サイトを開く
      </a>
    )
  } else if (field.type === 'date') {
    content = formatDate(String(raw))
  } else if (field.type === 'checkbox') {
    content = raw ? '✓ 確認済み' : '—'
  } else if (Array.isArray(raw)) {
    content = (
      <div className="flex flex-wrap gap-1">
        {raw.map((v) => (
          <span key={v} className="rounded-md bg-muted px-2 py-0.5 text-xs">
            {v}
          </span>
        ))}
      </div>
    )
  } else if (field.type === 'long_text') {
    content = <span className="whitespace-pre-wrap leading-relaxed">{String(raw)}</span>
  } else {
    content = String(raw)
  }

  return (
    <div className="flex flex-col gap-1 bg-card px-4 py-3 sm:flex-row sm:gap-4">
      <dt className="w-24 shrink-0 text-xs font-semibold text-muted-foreground">{field.name}</dt>
      <dd className="flex-1 text-sm text-foreground">{content}</dd>
    </div>
  )
}
