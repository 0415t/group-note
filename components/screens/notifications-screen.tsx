'use client'

import { useEffect } from 'react'
import { Bell, MessageCircle, UserPlus, RefreshCw, AtSign } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ScreenHeader, EmptyState } from '@/components/shared/primitives'
import { formatRelative } from '@/lib/format'
import type { AppNotification } from '@/lib/types'
import { cn } from '@/lib/utils'

const ICONS = {
  comment: MessageCircle,
  invite: UserPlus,
  memo_update: RefreshCw,
  mention: AtSign,
} as const

export function NotificationsScreen() {
  const { notifications, markNotificationsRead, navigate } = useStore()

  useEffect(() => {
    markNotificationsRead()
  }, [markNotificationsRead])

  return (
    <div className="flex min-h-full flex-col">
      <ScreenHeader title="通知" />
      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="size-6" />} title="通知はありません" />
      ) : (
        <ul className="flex flex-col">
          {notifications.map((n) => (
            <NotificationRow key={n.id} n={n} onOpen={() => n.memoId && navigate({ name: 'memoDetail', memoId: n.memoId })} />
          ))}
        </ul>
      )}
    </div>
  )
}

function NotificationRow({ n, onOpen }: { n: AppNotification; onOpen: () => void }) {
  const Icon = ICONS[n.type]
  return (
    <li>
      <button
        onClick={onOpen}
        className={cn(
          'flex w-full items-start gap-3 border-b border-border px-4 py-3.5 text-left transition-colors hover:bg-muted/50',
          !n.read && 'bg-primary/5',
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{n.title}</p>
          <p className="text-sm text-muted-foreground text-pretty">{n.body}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{formatRelative(n.createdAt)}</p>
        </div>
        {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
      </button>
    </li>
  )
}
