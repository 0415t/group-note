'use client'

import { useStore } from '@/lib/store'
import { LoginScreen } from '@/components/screens/login-screen'
import { HomeScreen } from '@/components/screens/home-screen'
import { GroupScreen } from '@/components/screens/group-screen'
import { MembersScreen } from '@/components/screens/members-screen'
import { MemoListScreen } from '@/components/screens/memo-list-screen'
import { MemoDetailScreen } from '@/components/screens/memo-detail-screen'
import { MemoEditScreen } from '@/components/screens/memo-edit-screen'
import { TemplateEditScreen } from '@/components/screens/template-edit-screen'
import { NotificationsScreen } from '@/components/screens/notifications-screen'
import { Plus } from 'lucide-react'

export function AppShell() {
  const { view, navigate } = useStore()

  if (view.name === 'login') {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-md">
        <LoginScreen />
      </div>
    )
  }

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md">
      {view.name === 'home' && <HomeScreen />}
      {view.name === 'group' && <GroupScreen groupId={view.groupId} />}
      {view.name === 'members' && <MembersScreen groupId={view.groupId} />}
      {view.name === 'templateEdit' && <TemplateEditScreen groupId={view.groupId} templateId={view.templateId} />}
      {view.name === 'memoList' && <MemoListScreen templateId={view.templateId} />}
      {view.name === 'memoDetail' && <MemoDetailScreen memoId={view.memoId} />}
      {view.name === 'memoEdit' && (
        <MemoEditScreen templateId={view.templateId} memoId={view.memoId} />
      )}
      {view.name === 'notifications' && <NotificationsScreen />}

      {view.name === 'memoList' && (
        <button
          onClick={() => navigate({ name: 'memoEdit', templateId: view.templateId })}
          aria-label="メモを追加"
          className="absolute bottom-6 right-5 z-30 flex h-14 items-center gap-2 rounded-full bg-primary px-5 font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
        >
          <Plus className="size-5" />
          メモを追加
        </button>
      )}
    </div>
  )
}
