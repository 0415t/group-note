'use client'

// クライアント側の状態ストア。
// サンプルデータを in-memory で保持し、画面遷移とデータ操作を提供する。
// 実DB化する際は、この層の関数を API 呼び出しに差し替えれば UI はそのまま使える。

import { createContext, useContext, useMemo, useState, useEffect, useCallback, type ReactNode } from 'react'
import type {
  Group,
  Template,
  Memo,
  Tag,
  AppNotification,
  User,
  ReactionType,
  MemoFieldValue,
  Visibility,
} from './types'
import {
  users as seedUsers,
  groups as seedGroups,
  templates as seedTemplates,
  memos as seedMemos,
  tags as seedTags,
  notifications as seedNotifications,
  favoriteMemoIds as seedFavorites,
  CURRENT_USER_ID,
} from './sample-data'
import type { BackendAction } from './api-types'
import { fetchBackendState, sendBackendAction } from './backend'

const DEMO_USER_ID = CURRENT_USER_ID
const AUTH_STORAGE_KEY = 'groupnote-auth-accounts'
const CURRENT_SESSION_KEY = 'groupnote-auth-current-user'

type StoredAccount = {
  id: string
  name: string
  email: string
  password: string
  avatarUrl?: string
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function toUser(account: StoredAccount): User {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    avatarUrl: account.avatarUrl,
  }
}

function getDemoAccounts(): StoredAccount[] {
  return [
    { id: 'u_me', name: 'あなた', email: 'you@example.com', password: 'password', avatarUrl: '/placeholder-user.jpg' },
    { id: 'u_tanaka', name: '田中', email: 'tanaka@example.com', password: 'password' },
    { id: 'u_sato', name: '佐藤', email: 'sato@example.com', password: 'password' },
    { id: 'u_suzuki', name: '鈴木', email: 'suzuki@example.com', password: 'password' },
    { id: 'u_kimura', name: '木村', email: 'kimura@example.com', password: 'password' },
  ]
}

function loadAuthAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return getDemoAccounts()

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      const demoAccounts = getDemoAccounts()
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoAccounts))
      return demoAccounts
    }

    const parsed = JSON.parse(raw) as Partial<StoredAccount>[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const demoAccounts = getDemoAccounts()
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoAccounts))
      return demoAccounts
    }

    return parsed.map((account) => ({
      id: account.id ?? `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: account.name ?? 'ユーザー',
      email: account.email ?? '',
      password: account.password ?? 'password',
      avatarUrl: account.avatarUrl ?? '/placeholder-user.jpg',
    }))
  } catch {
    const demoAccounts = getDemoAccounts()
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoAccounts))
    return demoAccounts
  }
}

function saveAuthAccounts(accounts: StoredAccount[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(accounts))
}

function loadCurrentUserId() {
  if (typeof window === 'undefined') return DEMO_USER_ID
  const savedId = window.localStorage.getItem(CURRENT_SESSION_KEY)
  return savedId || DEMO_USER_ID
}

function mergeUsersWithAuth(baseUsers: User[], authAccounts: StoredAccount[]) {
  const merged = new Map<string, User>()

  for (const user of baseUsers) {
    if (user.email) merged.set(normalizeEmail(user.email), user)
  }

  for (const account of authAccounts) {
    merged.set(normalizeEmail(account.email), toUser(account))
  }

  return Array.from(merged.values())
}

// ---- 画面（ナビゲーションスタック） ----
export type View =
  | { name: 'login' }
  | { name: 'home' }
  | { name: 'group'; groupId: string }
  | { name: 'templateEdit'; groupId: string; templateId?: string }
  | { name: 'memoList'; templateId: string }
  | { name: 'memoDetail'; memoId: string }
  | { name: 'memoEdit'; templateId: string; memoId?: string }
  | { name: 'members'; groupId: string }
  | { name: 'notifications' }

export interface NewMemoInput {
  templateId: string
  title: string
  values: Record<string, MemoFieldValue>
  tagIds: string[]
  visibility: Visibility
}

interface StoreValue {
  currentUserId: string
  users: User[]
  groups: Group[]
  templates: Template[]
  memos: Memo[]
  tags: Tag[]
  notifications: AppNotification[]
  favorites: string[]

  loginWithPassword: (email: string, password: string) => Promise<string>
  signUp: (input: { name: string; email: string; password: string }) => Promise<string>
  logout: () => void

  // ナビゲーション
  view: View
  stack: View[]
  navigate: (v: View) => void
  goBack: () => void
  goHome: () => void

  // ヘルパー
  getUser: (id: string) => User | undefined
  getGroup: (id: string) => Group | undefined
  getTemplate: (id: string) => Template | undefined
  getMemo: (id: string) => Memo | undefined

  // 操作
  toggleReaction: (memoId: string, type: ReactionType) => void
  addComment: (memoId: string, body: string) => void
  toggleFavorite: (memoId: string) => void
  createMemo: (input: NewMemoInput) => string
  updateMemo: (memoId: string, input: Omit<NewMemoInput, 'templateId'>) => void
  createGroup: (input: { name: string; description: string; icon: string; color: string }) => string
  joinGroup: (inviteCode: string) => string | null
  createTemplate: (input: Omit<Template, 'id' | 'createdAt' | 'createdBy'>) => string
  updateTemplate: (templateId: string, input: Omit<Template, 'id' | 'createdAt' | 'createdBy'>) => void
  archiveMemo: (memoId: string) => void
  markNotificationsRead: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

function nowISO() {
  return new Date().toISOString()
}

function generateInviteCode() {
  const base = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `G-${base}`
}

let idCounter = 1000
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}_${idCounter}`
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [authAccounts, setAuthAccounts] = useState<StoredAccount[]>(() => loadAuthAccounts())
  const [users, setUsers] = useState<User[]>(() => mergeUsersWithAuth(seedUsers, loadAuthAccounts()))
  const [groups, setGroups] = useState<Group[]>(() => seedGroups)
  const [templates, setTemplates] = useState<Template[]>(() => seedTemplates)
  const [tags, setTags] = useState<Tag[]>(() => seedTags)
  const [memos, setMemos] = useState<Memo[]>(() => seedMemos)
  const [notifications, setNotifications] = useState<AppNotification[]>(() => seedNotifications)
  const [favorites, setFavorites] = useState<string[]>(() => seedFavorites)
  const [currentUserId, setCurrentUserId] = useState<string>(() => loadCurrentUserId())

  const [stack, setStack] = useState<View[]>(() => {
    const restoredUserId = loadCurrentUserId()
    return restoredUserId !== DEMO_USER_ID ? [{ name: 'home' }] : [{ name: 'login' }]
  })

  useEffect(() => {
    setUsers((prev) => mergeUsersWithAuth(prev, authAccounts))
  }, [authAccounts])

  useEffect(() => {
    let isActive = true

    fetchBackendState()
      .then((state) => {
        if (!isActive) return
        setUsers((prev) => mergeUsersWithAuth(state.users, authAccounts))
        setGroups(state.groups)
        setTemplates(state.templates)
        setTags(state.tags)
        setMemos(state.memos)
        setNotifications(state.notifications)
        setFavorites(state.favorites)
      })
      .catch(() => {
        // サーバーが使えない場合はローカルのサンプル状態をそのまま使う
      })

    return () => {
      isActive = false
    }
  }, [authAccounts])

  const syncWithServer = useCallback(async (action: BackendAction) => {
    try {
      const response = await sendBackendAction(action)
      const { state } = response
      setUsers((prev) => mergeUsersWithAuth(state.users, authAccounts))
      setGroups(state.groups)
      setTemplates(state.templates)
      setTags(state.tags)
      setMemos(state.memos)
      setNotifications(state.notifications)
      setFavorites(state.favorites)
    } catch {
      // サーバーが利用できない場合はローカル更新だけを使う
    }
  }, [authAccounts])

  const view = stack[stack.length - 1]

  const navigate = useCallback((v: View) => {
    setStack((s) => [...s, v])
  }, [])
  const goBack = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
  }, [])
  const goHome = useCallback(() => {
    setStack([{ name: 'home' }])
  }, [])

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload.userId) {
        throw new Error(payload.error || 'メールアドレスまたはパスワードが正しくありません。')
      }

      setCurrentUserId(payload.userId)
      window.localStorage.setItem(CURRENT_SESSION_KEY, payload.userId)
      setStack([{ name: 'home' }])
      return payload.userId
    },
    [],
  )

  const signUp = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', name, email, password }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload.userId) {
        throw new Error(payload.error || '新規登録に失敗しました。')
      }

      setCurrentUserId(payload.userId)
      window.localStorage.setItem(CURRENT_SESSION_KEY, payload.userId)
      setStack([{ name: 'home' }])
      return payload.userId
    },
    [],
  )

  const logout = useCallback(() => {
    setCurrentUserId(DEMO_USER_ID)
    window.localStorage.removeItem(CURRENT_SESSION_KEY)
    setStack([{ name: 'login' }])
  }, [])

  const getUser = useCallback((id: string) => users.find((u) => u.id === id), [users])
  const getGroup = useCallback((id: string) => groups.find((g) => g.id === id), [groups])
  const getTemplate = useCallback((id: string) => templates.find((t) => t.id === id), [templates])
  const getMemo = useCallback((id: string) => memos.find((m) => m.id === id), [memos])

  const toggleReaction = useCallback((memoId: string, type: ReactionType) => {
    setMemos((prev) =>
      prev.map((m) => {
        if (m.id !== memoId) return m
        const existing = m.reactions.find((r) => r.userId === currentUserId && r.type === type)
        const reactions = existing
          ? m.reactions.filter((r) => !(r.userId === currentUserId && r.type === type))
          : [...m.reactions, { userId: currentUserId, type }]
        return { ...m, reactions }
      }),
    )
    syncWithServer({ type: 'toggleReaction', payload: { memoId, type } })
  }, [currentUserId, syncWithServer])

  const addComment = useCallback((memoId: string, body: string) => {
    setMemos((prev) =>
      prev.map((m) => {
        if (m.id !== memoId) return m
        const comment = {
          id: nextId('c'),
          memoId,
          userId: currentUserId,
          body,
          createdAt: nowISO(),
        }
        const log = {
          id: nextId('l'),
          memoId,
          userId: currentUserId,
          action: 'commented' as const,
          detail: 'コメントを追加しました',
          createdAt: nowISO(),
        }
        return {
          ...m,
          comments: [...m.comments, comment],
          activity: [...m.activity, log],
          updatedAt: nowISO(),
        }
      }),
    )
    syncWithServer({ type: 'addComment', payload: { memoId, body } })
  }, [currentUserId, syncWithServer])

  const toggleFavorite = useCallback((memoId: string) => {
    setFavorites((prev) =>
      prev.includes(memoId) ? prev.filter((id) => id !== memoId) : [...prev, memoId],
    )
    syncWithServer({ type: 'toggleFavorite', payload: { memoId } })
  }, [syncWithServer])

  const createMemo = useCallback(
    (input: NewMemoInput) => {
      const template = templates.find((t) => t.id === input.templateId)
      const id = nextId('m')
      const memo: Memo = {
        id,
        groupId: template?.groupId ?? '',
        templateId: input.templateId,
        title: input.title,
        values: input.values,
        tagIds: input.tagIds,
        attachments: [],
        createdBy: currentUserId,
        visibility: input.visibility,
        status: 'published',
        reactions: [],
        comments: [],
        activity: [
          {
            id: nextId('l'),
            memoId: id,
            userId: currentUserId,
            action: 'created',
            detail: 'メモを作成しました',
            createdAt: nowISO(),
          },
        ],
        viewCount: 0,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      }
      setMemos((prev) => [memo, ...prev])
      syncWithServer({ type: 'createMemo', payload: { ...input, id } })
      return id
    },
    [currentUserId, syncWithServer, templates],
  )

  const updateMemo = useCallback(
    (memoId: string, input: Omit<NewMemoInput, 'templateId'>) => {
      setMemos((prev) =>
        prev.map((m) => {
          if (m.id !== memoId) return m
          const log = {
            id: nextId('l'),
            memoId,
            userId: currentUserId,
            action: 'edited' as const,
            detail: 'メモを編集しました',
            createdAt: nowISO(),
          }
          return {
            ...m,
            title: input.title,
            values: input.values,
            tagIds: input.tagIds,
            visibility: input.visibility,
            activity: [...m.activity, log],
            updatedAt: nowISO(),
          }
        }),
      )
      syncWithServer({ type: 'updateMemo', payload: { memoId, input } })
    },
    [currentUserId, syncWithServer],
  )

  const createGroup = useCallback(
    (input: { name: string; description: string; icon: string; color: string }) => {
      const id = nextId('g')
      let inviteCode = generateInviteCode()
      while (groups.some((g) => g.inviteCode === inviteCode)) {
        inviteCode = generateInviteCode()
      }

      const group: Group = {
        id,
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        ownerId: currentUserId,
        members: [{ userId: currentUserId, role: 'owner', joinedAt: nowISO() }],
        inviteCode,
        createdAt: nowISO(),
      }

      setGroups((prev) => [group, ...prev])
      syncWithServer({ type: 'createGroup', payload: { ...input, id } })
      return id
    },
    [currentUserId, groups, syncWithServer],
  )

  const joinGroup = useCallback(
    (inviteCode: string) => {
      const normalized = inviteCode.trim().toUpperCase()
      const target = groups.find((g) => g.inviteCode.toUpperCase() === normalized)
      if (!target) return null
      if (target.members.some((m) => m.userId === currentUserId)) return target.id

      setGroups((prev) =>
        prev.map((g) =>
          g.id === target.id
            ? {
                ...g,
                members: [...g.members, { userId: currentUserId, role: 'member', joinedAt: nowISO() }],
              }
            : g,
        ),
      )
      syncWithServer({ type: 'joinGroup', payload: { inviteCode } })
      return target.id
    },
    [currentUserId, groups, syncWithServer],
  )

  const createTemplate = useCallback(
    (input: Omit<Template, 'id' | 'createdAt' | 'createdBy'>) => {
      const id = nextId('t')
      const template: Template = {
        id,
        groupId: input.groupId,
        name: input.name,
        description: input.description,
        icon: input.icon,
        fields: input.fields,
        createdBy: currentUserId,
        createdAt: nowISO(),
      }
      setTemplates((prev) => [template, ...prev])
      syncWithServer({ type: 'createTemplate', payload: { ...input, id } })
      return id
    },
    [currentUserId, syncWithServer],
  )

  const updateTemplate = useCallback(
    (templateId: string, input: Omit<Template, 'id' | 'createdAt' | 'createdBy'>) => {
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === templateId
            ? {
                ...template,
                groupId: input.groupId,
                name: input.name,
                description: input.description,
                icon: input.icon,
                fields: input.fields,
              }
            : template,
        ),
      )
      syncWithServer({ type: 'updateTemplate', payload: { templateId, input } })
    },
    [syncWithServer],
  )

  const archiveMemo = useCallback((memoId: string) => {
    setMemos((prev) =>
      prev.map((m) =>
        m.id === memoId
          ? {
              ...m,
              status: 'archived',
              activity: [
                ...m.activity,
                {
                  id: nextId('l'),
                  memoId,
                  userId: currentUserId,
                  action: 'archived' as const,
                  detail: 'メモをアーカイブしました',
                  createdAt: nowISO(),
                },
              ],
              updatedAt: nowISO(),
            }
          : m,
      ),
    )
    syncWithServer({ type: 'archiveMemo', payload: { memoId } })
  }, [currentUserId, syncWithServer])

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    syncWithServer({ type: 'markNotificationsRead', payload: {} })
  }, [syncWithServer])

  const value = useMemo<StoreValue>(
    () => ({
      currentUserId,
      users,
      groups,
      templates,
      memos,
      tags,
      notifications,
      favorites,
      loginWithPassword,
      signUp,
      logout,
      view,
      stack,
      navigate,
      goBack,
      goHome,
      getUser,
      getGroup,
      getTemplate,
      getMemo,
      toggleReaction,
      addComment,
      toggleFavorite,
      createMemo,
      updateMemo,
      createGroup,
      joinGroup,
      createTemplate,
      updateTemplate,
      archiveMemo,
      markNotificationsRead,
    }),
    [
      currentUserId,
      users,
      groups,
      templates,
      memos,
      tags,
      notifications,
      favorites,
      loginWithPassword,
      signUp,
      logout,
      view,
      stack,
      navigate,
      goBack,
      goHome,
      getUser,
      getGroup,
      getTemplate,
      getMemo,
      toggleReaction,
      addComment,
      toggleFavorite,
      createMemo,
      updateMemo,
      createGroup,
      joinGroup,
      createTemplate,
      updateTemplate,
      archiveMemo,
      markNotificationsRead,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
