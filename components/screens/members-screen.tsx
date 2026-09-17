'use client'

import { Crown } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ScreenHeader, Avatar } from '@/components/shared/primitives'
import { formatDate } from '@/lib/format'

export function MembersScreen({ groupId }: { groupId: string }) {
  const { getGroup, getUser, currentUserId } = useStore()
  const group = getGroup(groupId)
  if (!group) return null

  const sorted = [...group.members].sort((a, b) => (a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : 0))

  return (
    <div className="flex min-h-full flex-col">
      <ScreenHeader title="メンバー" subtitle={`${group.members.length}人が参加中`} />
      <ul className="flex flex-col">
        {sorted.map((m) => {
          const user = getUser(m.userId)
          const isMe = m.userId === currentUserId
          return (
            <li key={m.userId} className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <Avatar user={user} size={40} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-semibold text-foreground">
                  {user?.name}
                  {isMe && <span className="text-xs font-normal text-muted-foreground">（あなた）</span>}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(m.joinedAt)}に参加</p>
              </div>
              {m.role === 'owner' ? (
                <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                  <Crown className="size-3.5" />
                  オーナー
                </span>
              ) : (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  メンバー
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
