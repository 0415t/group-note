'use client'

import { useState } from 'react'
import { Star, ImagePlus, Eye, Lock, AlertCircle } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ScreenHeader } from '@/components/shared/primitives'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MemoFieldValue, TemplateField, Visibility } from '@/lib/types'

export function MemoEditScreen({ templateId, memoId }: { templateId: string; memoId?: string }) {
  const { getTemplate, getMemo, tags, createMemo, updateMemo, navigate, goBack } = useStore()
  const template = getTemplate(templateId)
  const existing = memoId ? getMemo(memoId) : undefined

  const [title, setTitle] = useState(existing?.title ?? '')
  const [values, setValues] = useState<Record<string, MemoFieldValue>>(existing?.values ?? {})
  const [tagIds, setTagIds] = useState<string[]>(existing?.tagIds ?? [])
  const [visibility, setVisibility] = useState<Visibility>(existing?.visibility ?? 'group')
  const [error, setError] = useState('')

  if (!template) return null

  const groupTags = tags.filter((t) => t.groupId === template.groupId)
  const editableFields = template.fields
    .filter((f) => f.type !== 'image' && f.type !== 'file')
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const setValue = (id: string, v: MemoFieldValue) => setValues((prev) => ({ ...prev, [id]: v }))

  const handleSave = () => {
    if (!title.trim()) {
      setError('タイトルを入力してください。')
      return
    }
    for (const f of template.fields) {
      if (f.required) {
        const v = values[f.id]
        if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) {
          setError(`「${f.name}」は必須項目です。`)
          return
        }
      }
    }
    if (memoId) {
      updateMemo(memoId, { title: title.trim(), values, tagIds, visibility })
      goBack()
    } else {
      const id = createMemo({ templateId, title: title.trim(), values, tagIds, visibility })
      goBack()
      navigate({ name: 'memoDetail', memoId: id })
    }
  }

  return (
    <div className="flex min-h-full flex-col pb-24">
      <ScreenHeader title={memoId ? 'メモを編集' : `${template.name}テンプレートでメモを追加`} />

      <div className="flex flex-col gap-4 px-4 pt-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* タイトル */}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground">
            タイトル<span className="text-primary"> *</span>
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：〇〇カフェ 渋谷店"
            className="h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-ring/30"
          />
        </label>

        {/* テンプレート項目 */}
        {editableFields.map((f) => (
          <FieldInput key={f.id} field={f} value={values[f.id]} onChange={(v) => setValue(f.id, v)} />
        ))}

        {/* 添付（デモ） */}
        <div>
          <p className="mb-1.5 text-xs font-semibold text-foreground">写真・ファイル</p>
          <button
            type="button"
            className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-primary/40"
          >
            <ImagePlus className="size-6" />
            <span className="text-xs">写真を撮る・選択する</span>
          </button>
        </div>

        {/* タグ */}
        <div>
          <p className="mb-1.5 text-xs font-semibold text-foreground">タグ</p>
          <div className="flex flex-wrap gap-1.5">
            {groupTags.map((t) => {
              const active = tagIds.includes(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setTagIds((prev) => (active ? prev.filter((id) => id !== t.id) : [...prev, t.id]))
                  }
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    active ? 'border-transparent text-white' : 'border-border bg-background text-foreground',
                  )}
                  style={active ? { backgroundColor: t.color } : undefined}
                >
                  #{t.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* 公開範囲 */}
        <div>
          <p className="mb-1.5 text-xs font-semibold text-foreground">公開範囲</p>
          <div className="grid grid-cols-2 gap-2">
            <VisibilityOption
              active={visibility === 'group'}
              onClick={() => setVisibility('group')}
              icon={<Eye className="size-4" />}
              label="グループ全員"
            />
            <VisibilityOption
              active={visibility === 'private'}
              onClick={() => setVisibility('private')}
              icon={<Lock className="size-4" />}
              label="自分のみ"
            />
          </div>
        </div>
      </div>

      {/* 保存バー */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[440px] gap-2 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-md">
        <Button variant="outline" className="h-12 flex-1" onClick={goBack}>
          キャンセル
        </Button>
        <Button className="h-12 flex-[2] font-bold" onClick={handleSave}>
          {memoId ? '変更を保存' : '投稿する'}
        </Button>
      </div>
    </div>
  )
}

function VisibilityOption({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors',
        active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: TemplateField
  value: MemoFieldValue
  onChange: (v: MemoFieldValue) => void
}) {
  const label = (
    <span className="text-xs font-semibold text-foreground">
      {field.name}
      {field.required && <span className="text-primary"> *</span>}
    </span>
  )

  const inputClass =
    'h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-ring/30'

  switch (field.type) {
    case 'long_text':
      return (
        <label className="flex flex-col gap-1.5">
          {label}
          <textarea
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            placeholder="感想や補足を入力"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed outline-none focus:border-primary focus:ring-3 focus:ring-ring/30"
          />
        </label>
      )
    case 'number':
      return (
        <label className="flex flex-col gap-1.5">
          {label}
          <input
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            className={inputClass}
          />
        </label>
      )
    case 'date':
      return (
        <label className="flex flex-col gap-1.5">
          {label}
          <input
            type="date"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        </label>
      )
    case 'url':
      return (
        <label className="flex flex-col gap-1.5">
          {label}
          <input
            type="url"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://"
            className={inputClass}
          />
        </label>
      )
    case 'rating':
      return (
        <div className="flex flex-col gap-1.5">
          {label}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" onClick={() => onChange(i)} aria-label={`${i}点`}>
                <Star
                  className={cn(
                    'size-8 transition-colors',
                    i <= Number(value ?? 0)
                      ? 'fill-[oklch(0.72_0.14_70)] text-[oklch(0.72_0.14_70)]'
                      : 'fill-muted text-muted-foreground/40',
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      )
    case 'checkbox':
      return (
        <label className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          {label}
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="size-5 accent-[oklch(0.63_0.19_27)]"
          />
        </label>
      )
    case 'single_select':
      return (
        <div className="flex flex-col gap-1.5">
          {label}
          <div className="flex flex-wrap gap-1.5">
            {(field.options ?? []).map((o) => (
              <Chip key={o} active={value === o} onClick={() => onChange(value === o ? null : o)}>
                {o}
              </Chip>
            ))}
          </div>
        </div>
      )
    case 'multi_select': {
      const arr = Array.isArray(value) ? value : []
      return (
        <div className="flex flex-col gap-1.5">
          {label}
          <div className="flex flex-wrap gap-1.5">
            {(field.options ?? []).map((o) => {
              const active = arr.includes(o)
              return (
                <Chip
                  key={o}
                  active={active}
                  onClick={() => onChange(active ? arr.filter((v) => v !== o) : [...arr, o])}
                >
                  {o}
                </Chip>
              )
            })}
          </div>
        </div>
      )
    }
    default:
      return (
        <label className="flex flex-col gap-1.5">
          {label}
          <input
            type="text"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        </label>
      )
  }
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:border-primary/40',
      )}
    >
      {children}
    </button>
  )
}
