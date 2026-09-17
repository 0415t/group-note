'use client'

import { useState } from 'react'
import { Users, Copy, Check, ChevronRight, Settings, Plus } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ScreenHeader, Avatar, SectionTitle } from '@/components/shared/primitives'
import { MemoCard } from '@/components/shared/memo-card'
import { Button } from '@/components/ui/button'
import { formatRelative } from '@/lib/format'

export function GroupScreen({ groupId }: { groupId: string }) {
  const { getGroup, templates, memos, navigate } = useStore()
  const group = getGroup(groupId)
  const [copied, setCopied] = useState(false)

  if (!group) return null

  const groupTemplates = templates.filter((t) => t.groupId === groupId)
  const groupMemos = memos.filter((m) => m.groupId === groupId && m.status === 'published')
  const recent = [...groupMemos].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 3)

  const copyInvite = async () => {
    try {
      await navigator.clipboard?.writeText(group.inviteCode)
    } catch {
      // クリップボード非対応環境は無視
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="flex min-h-full flex-col pb-8">
      <ScreenHeader
        title={group.name}
        right={
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => navigate({ name: 'members', groupId })}
            aria-label="グループ設定"
          >
            <Settings className="size-5" />
          </Button>
        }
      />

      {/* グループ情報 */}
      <div className="px-4 pt-4">
        <div className="flex items-start gap-3">
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-3xl"
            style={{ backgroundColor: `color-mix(in oklch, ${group.color} 14%, transparent)` }}
          >
            {group.icon}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-lg font-extrabold text-foreground text-balance">{group.name}</h2>
            <button
              onClick={() => navigate({ name: 'members', groupId })}
              className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"
            >
              <Users className="size-3.5" />
              メンバー{group.members.length}人
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
          {group.description}
        </p>

        {/* 招待コード */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-muted-foreground">招待コード</p>
            <p className="font-mono text-lg font-bold tracking-wider text-foreground">{group.inviteCode}</p>
          </div>
          <Button size="sm" className="h-9 gap-1.5 px-3" onClick={copyInvite}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'コピー済み' : 'コピー'}
          </Button>
        </div>
      </div>

      {/* テンプレート一覧 */}
      <SectionTitle
        action={
          <button
            onClick={() => navigate({ name: 'templateEdit', groupId })}
            className="flex items-center gap-0.5 text-xs font-semibold text-primary"
          >
            <Plus className="size-3.5" /> 追加
          </button>
        }
      >
        テンプレート
      </SectionTitle>
      <div className="flex flex-col gap-2 px-4">
        {groupTemplates.map((t) => {
          const count = memos.filter((m) => m.templateId === t.id && m.status === 'published').length
          const last = memos
            .filter((m) => m.templateId === t.id)
            .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))[0]
          return (
            <div key={t.id} className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40">
              <button
                onClick={() => navigate({ name: 'memoList', templateId: t.id })}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
                  {t.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-foreground">{t.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{t.description}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {count}件{last && `・${formatRelative(last.updatedAt)}に更新`}
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </button>
              <button
                onClick={() => navigate({ name: 'templateEdit', groupId, templateId: t.id })}
                className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
              >
                編集
              </button>
            </div>
          )
        })}
      </div>

      {/* 最近更新されたメモ */}
      {recent.length > 0 && (
        <>
          <SectionTitle>最近の更新</SectionTitle>
          <div className="flex flex-col gap-2 px-4">
            {recent.map((m) => (
              <MemoCard key={m.id} memo={m} template={groupTemplates.find((t) => t.id === m.templateId)!} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
