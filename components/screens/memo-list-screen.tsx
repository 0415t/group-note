'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, ArrowUpDown, X, FileSearch } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ScreenHeader, EmptyState } from '@/components/shared/primitives'
import { MemoCard } from '@/components/shared/memo-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Memo, Template, TemplateField } from '@/lib/types'

type SortKey = 'new' | 'updated' | 'rating' | 'favorite' | 'views'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'updated', label: '更新順' },
  { key: 'new', label: '新着順' },
  { key: 'rating', label: '評価順' },
  { key: 'favorite', label: 'お気に入り順' },
  { key: 'views', label: '閲覧数順' },
]

export function MemoListScreen({ templateId }: { templateId: string }) {
  const { getTemplate, memos, tags, favorites } = useStore()
  const template = getTemplate(templateId)

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('updated')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [filters, setFilters] = useState<Record<string, string[]>>({})

  const ratingFieldId = useMemo(
    () => template?.fields.find((f) => f.type === 'rating')?.id,
    [template],
  )

  const filterFields = useMemo(
    () =>
      (template?.fields ?? []).filter(
        (f) => f.filterable && ['single_select', 'multi_select', 'rating'].includes(f.type),
      ),
    [template],
  )

  const filtered = useMemo(() => {
    if (!template) return []
    let list = memos.filter((m) => m.templateId === templateId && m.status === 'published')

    // 検索（タイトル + 検索対象フィールド + タグ）
    const q = query.trim().toLowerCase()
    if (q) {
      const searchableIds = template.fields.filter((f) => f.searchable).map((f) => f.id)
      list = list.filter((m) => {
        if (m.title.toLowerCase().includes(q)) return true
        for (const id of searchableIds) {
          const v = m.values[id]
          if (v && String(v).toLowerCase().includes(q)) return true
        }
        const memoTagNames = tags.filter((t) => m.tagIds.includes(t.id)).map((t) => t.name.toLowerCase())
        return memoTagNames.some((n) => n.includes(q))
      })
    }

    // 絞り込み
    for (const [fieldId, selected] of Object.entries(filters)) {
      if (!selected.length) continue
      const field = template.fields.find((f) => f.id === fieldId)
      if (!field) continue
      list = list.filter((m) => {
        const v = m.values[fieldId]
        if (field.type === 'rating') {
          const min = Math.min(...selected.map(Number))
          return Number(v ?? 0) >= min
        }
        if (field.type === 'multi_select') {
          const arr = Array.isArray(v) ? v : []
          return selected.some((s) => arr.includes(s))
        }
        return selected.includes(String(v))
      })
    }

    // 並び替え
    const byRating = (m: Memo) => (ratingFieldId ? Number(m.values[ratingFieldId] ?? 0) : 0)
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'new':
          return +new Date(b.createdAt) - +new Date(a.createdAt)
        case 'rating':
          return byRating(b) - byRating(a)
        case 'favorite': {
          const fa = favorites.includes(a.id) ? 1 : 0
          const fb = favorites.includes(b.id) ? 1 : 0
          return fb - fa || +new Date(b.updatedAt) - +new Date(a.updatedAt)
        }
        case 'views':
          return b.viewCount - a.viewCount
        default:
          return +new Date(b.updatedAt) - +new Date(a.updatedAt)
      }
    })
    return list
  }, [template, templateId, memos, query, filters, sort, tags, favorites, ratingFieldId])

  if (!template) return null

  const activeFilterCount = Object.values(filters).reduce((n, v) => n + v.length, 0)
  const currentSortLabel = SORT_OPTIONS.find((s) => s.key === sort)?.label

  const toggleFilter = (fieldId: string, value: string) => {
    setFilters((prev) => {
      const cur = prev[fieldId] ?? []
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
      return { ...prev, [fieldId]: next }
    })
  }

  return (
    <div className="flex min-h-full flex-col">
      <ScreenHeader title={template.name} subtitle={`${filtered.length}件のメモ`} />

      {/* 検索 & ツールバー */}
      <div className="sticky top-[57px] z-10 flex flex-col gap-2 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${template.name}のメモを検索`}
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-9 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-ring/30"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="検索クリア"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeFilterCount > 0 ? 'default' : 'outline'}
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => {
              setShowFilter((v) => !v)
              setShowSort(false)
            }}
          >
            <SlidersHorizontal className="size-3.5" />
            絞り込み
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary-foreground/25 px-1.5 text-[11px]">{activeFilterCount}</span>
            )}
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => {
                setShowSort((v) => !v)
                setShowFilter(false)
              }}
            >
              <ArrowUpDown className="size-3.5" />
              {currentSortLabel}
            </Button>
            {showSort && (
              <div className="absolute left-0 top-9 z-30 w-40 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => {
                      setSort(o.key)
                      setShowSort(false)
                    }}
                    className={cn(
                      'block w-full px-3 py-2 text-left text-sm hover:bg-muted',
                      sort === o.key && 'font-semibold text-primary',
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters({})}
              className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              クリア
            </button>
          )}
        </div>

        {showFilter && (
          <FilterPanel fields={filterFields} filters={filters} onToggle={toggleFilter} />
        )}
      </div>

      {/* 一覧 */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileSearch className="size-6" />}
            title="メモが見つかりません"
            description={`検索条件を変えるか、${template.name}用の新しいメモを追加してみましょう。`}
          />
        ) : (
          filtered.map((m) => <MemoCard key={m.id} memo={m} template={template} />)
        )}
      </div>
    </div>
  )
}

function FilterPanel({
  fields,
  filters,
  onToggle,
}: {
  fields: TemplateField[]
  filters: Record<string, string[]>
  onToggle: (fieldId: string, value: string) => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3">
      {fields.map((f) => {
        const options =
          f.type === 'rating' ? ['5', '4', '3'] : (f.options ?? [])
        const labelFor = (o: string) => (f.type === 'rating' ? `★${o}以上` : o)
        return (
          <div key={f.id}>
            <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">{f.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {options.map((o) => {
                const active = (filters[f.id] ?? []).includes(o)
                return (
                  <button
                    key={o}
                    onClick={() => onToggle(f.id, o)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:border-primary/40',
                    )}
                  >
                    {labelFor(o)}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
