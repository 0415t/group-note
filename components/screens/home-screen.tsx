'use client'

import { useState } from 'react'
import { Bell, ChevronRight, Plus, Heart, Clock, UserPlus } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Avatar, SectionTitle } from '@/components/shared/primitives'
import { MemoCard } from '@/components/shared/memo-card'
import { Button } from '@/components/ui/button'

export function HomeScreen() {
  const store = useStore()
  const { groups, memos, templates, favorites, notifications, getUser, currentUserId, navigate, createGroup, joinGroup } =
    store

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const me = getUser(currentUserId)
  const unread = notifications.filter((n) => !n.read).length

  const myGroups = groups.filter((g) => g.members.some((m) => m.userId === currentUserId))

  const publishedMemos = memos.filter((m) => m.status === 'published')
  const recentMemos = [...publishedMemos]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 3)
  const favoriteMemos = publishedMemos.filter((m) => favorites.includes(m.id))

  const templateFor = (id: string) => templates.find((t) => t.id === id)!

  const handleCreateGroup = () => {
    const name = groupName.trim()
    if (!name) return
    const id = createGroup({
      name,
      description: groupDescription.trim() || '新しく作ったグループです。',
      icon: '👥',
      color: 'oklch(0.58 0.16 250)',
    })
    setGroupName('')
    setGroupDescription('')
    setShowCreateForm(false)
    navigate({ name: 'group', groupId: id })
  }

  const handleJoinGroup = () => {
    const code = inviteCode.trim()
    if (!code) return
    const id = joinGroup(code)
    if (id) {
      setInviteCode('')
      setShowJoinForm(false)
      navigate({ name: 'group', groupId: id })
    }
  }

  return (
    <div className="flex min-h-full flex-col pb-8">
      {/* トップバー */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md">
        <div>
          <p className="text-xs text-muted-foreground">こんにちは</p>
          <p className="font-bold text-foreground">{me?.name} さん</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full"
            onClick={() => navigate({ name: 'notifications' })}
            aria-label="通知"
          >
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unread}
              </span>
            )}
          </Button>
          <Avatar user={me} size={36} />
        </div>
      </header>

      {/* グループ一覧 */}
      <SectionTitle
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowCreateForm((v) => !v)
                setShowJoinForm(false)
              }}
              className="flex items-center gap-0.5 text-xs font-semibold text-primary"
            >
              <Plus className="size-3.5" /> 作成
            </button>
            <button
              onClick={() => {
                setShowJoinForm((v) => !v)
                setShowCreateForm(false)
              }}
              className="flex items-center gap-0.5 text-xs font-semibold text-primary"
            >
              <UserPlus className="size-3.5" /> 参加
            </button>
          </div>
        }
      >
        あなたのグループ
      </SectionTitle>
      {(showCreateForm || showJoinForm) && (
        <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-3">
          {showCreateForm && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">グループ名</label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                placeholder="例: 情シス2組"
              />
              <label className="text-xs font-semibold text-muted-foreground">説明</label>
              <input
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                placeholder="どんな場かを入力"
              />
              <Button onClick={handleCreateGroup} className="w-full">グループを作成</Button>
            </div>
          )}
          {showJoinForm && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">招待コード</label>
              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm uppercase"
                placeholder="G-ABC123"
              />
              <Button onClick={handleJoinGroup} className="w-full">招待コードで参加</Button>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2 px-4">
        {myGroups.map((g) => {
          const memoCount = memos.filter((m) => m.groupId === g.id && m.status === 'published').length
          const templateCount = templates.filter((t) => t.groupId === g.id).length
          return (
            <button
              key={g.id}
              onClick={() => navigate({ name: 'group', groupId: g.id })}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40"
            >
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `color-mix(in oklch, ${g.color} 14%, transparent)` }}
              >
                {g.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-foreground">{g.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  メンバー{g.members.length}人・テンプレート{templateCount}個・メモ{memoCount}件
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </button>
          )
        })}
      </div>

      {/* 最近更新されたメモ */}
      <SectionTitle>
        <span className="flex items-center gap-1.5">
          <Clock className="size-4 text-primary" /> 最近の更新
        </span>
      </SectionTitle>
      <div className="flex flex-col gap-2 px-4">
        {recentMemos.map((m) => (
          <MemoCard key={m.id} memo={m} template={templateFor(m.templateId)} />
        ))}
      </div>

      {/* お気に入り */}
      {favoriteMemos.length > 0 && (
        <>
          <SectionTitle>
            <span className="flex items-center gap-1.5">
              <Heart className="size-4 fill-primary text-primary" /> お気に入り
            </span>
          </SectionTitle>
          <div className="flex flex-col gap-2 px-4">
            {favoriteMemos.map((m) => (
              <MemoCard key={m.id} memo={m} template={templateFor(m.templateId)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
