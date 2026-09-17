import { prisma } from './prisma'
import { hashPassword, verifyPassword } from './password'
import type { AppNotification, Attachment, Group, Memo, MemoFieldValue, Role, Tag, Template } from './types'
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
import type {
  BackendAction,
  BackendActionResponse,
  BackendState,
  CreateMemoPayload,
  CreateGroupPayload,
  CreateTemplatePayload,
  UpdateMemoPayload,
} from './api-types'

type PrismaTemplateField = {
  id: string
  templateId: string
  name: string
  description: string | null
  type: string
  options: string | null
  required: boolean
  visibleInList: boolean
  searchable: boolean
  filterable: boolean
  sortOrder: number
}

type PrismaTemplate = {
  id: string
  groupId: string
  name: string
  description: string
  icon: string
  createdBy: string
  createdAt: Date
  fields: PrismaTemplateField[]
}

type PrismaMemo = {
  id: string
  groupId: string
  templateId: string
  title: string
  values: string
  createdBy: string
  visibility: string
  status: string
  viewCount: number
  createdAt: Date
  updatedAt: Date
  attachments: Array<{ id: string; memoId: string; kind: string; name: string; url: string; size: number }>
  reactions: Array<{ id: string; memoId: string; userId: string; type: string }>
  comments: Array<{ id: string; memoId: string; userId: string; body: string; createdAt: Date }>
  activity: Array<{ id: string; memoId: string; userId: string; action: string; detail: string; createdAt: Date }>
  tags: Array<{ memoId: string; tagId: string }>
}

type PrismaGroupMember = {
  groupId: string
  userId: string
  role: string
  joinedAt: Date
}

type PrismaGroup = Omit<Group, 'members' | 'createdAt'> & {
  createdAt: Date
  members: PrismaGroupMember[]
}

type PrismaNotification = {
  id: string
  type: string
  title: string
  body: string
  createdAt: Date
  read: boolean
  memoId: string | null
}

function nowISO() {
  return new Date().toISOString()
}

function nextId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`
}

function parseJson<T>(value: string | null): T | undefined {
  if (value === null || value === undefined) return undefined
  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

async function ensureSeeded() {
  const count = await prisma.user.count()

  await prisma.user.updateMany({
    where: {
      OR: [{ password: null }, { password: '' }],
    },
    data: {
      password: 'password',
    },
  })

  if (count > 0) return

  const seededUsers = seedUsers.map((user) => ({
    ...user,
    password: 'password',
    avatarUrl: user.avatarUrl ?? null,
  }))

  const groupMembers = seedGroups.flatMap((group) =>
    group.members.map((member) => ({
      groupId: group.id,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
    })),
  )

  const templateFields = seedTemplates.flatMap((template) =>
    template.fields.map((field) => ({
      id: field.id,
      templateId: template.id,
      name: field.name,
      description: field.description ?? null,
      type: field.type,
      options: field.options ? JSON.stringify(field.options) : null,
      required: field.required,
      visibleInList: field.visibleInList,
      searchable: field.searchable,
      filterable: field.filterable,
      sortOrder: field.sortOrder,
    })),
  )

  const memoData = seedMemos.map((memo) => ({
    id: memo.id,
    groupId: memo.groupId,
    templateId: memo.templateId,
    title: memo.title,
    values: JSON.stringify(memo.values),
    createdBy: memo.createdBy,
    visibility: memo.visibility,
    status: memo.status,
    viewCount: memo.viewCount,
    createdAt: memo.createdAt,
    updatedAt: memo.updatedAt,
  }))

  const attachments = seedMemos.flatMap((memo) =>
    memo.attachments.map((attachment) => ({
      ...attachment,
      memoId: memo.id,
    })),
  )

  const reactions = seedMemos.flatMap((memo) =>
    memo.reactions.map((reaction) => ({
      id: nextId('r'),
      memoId: memo.id,
      userId: reaction.userId,
      type: reaction.type,
    })),
  )

  const comments = seedMemos.flatMap((memo) =>
    memo.comments.map((comment) => ({
      ...comment,
      memoId: memo.id,
    })),
  )

  const activityLogs = seedMemos.flatMap((memo) =>
    memo.activity.map((activity) => ({
      ...activity,
      memoId: memo.id,
    })),
  )

  const memoTags = seedMemos.flatMap((memo) =>
    memo.tagIds.map((tagId) => ({ memoId: memo.id, tagId })),
  )

  const favoriteData = seedFavorites.map((memoId) => ({
    memoId,
    userId: CURRENT_USER_ID,
  }))

  const notificationData = seedNotifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    createdAt: notification.createdAt,
    read: notification.read,
    memoId: notification.memoId ?? null,
  }))

  await prisma.$transaction([
    prisma.user.createMany({ data: seededUsers }),
    prisma.group.createMany({
      data: seedGroups.map(({ members, ...group }) => ({
        ...group,
      })),
    }),
    prisma.groupMember.createMany({ data: groupMembers }),
    prisma.template.createMany({
      data: seedTemplates.map((template) => ({
        id: template.id,
        groupId: template.groupId,
        name: template.name,
        description: template.description,
        icon: template.icon,
        createdBy: template.createdBy,
        createdAt: template.createdAt,
      })),
    }),
    prisma.templateField.createMany({ data: templateFields }),
    prisma.tag.createMany({ data: seedTags }),
    prisma.memo.createMany({ data: memoData }),
    prisma.attachment.createMany({ data: attachments }),
    prisma.reaction.createMany({ data: reactions }),
    prisma.comment.createMany({ data: comments }),
    prisma.activityLog.createMany({ data: activityLogs }),
    prisma.memoTag.createMany({ data: memoTags }),
    prisma.favorite.createMany({ data: favoriteData }),
    prisma.notification.createMany({ data: notificationData }),
  ])
}

function mapTemplate(template: PrismaTemplate) {
  return {
    ...template,
    createdAt: template.createdAt.toISOString(),
    fields: template.fields.map((field) => ({
      id: field.id,
      templateId: field.templateId,
      name: field.name,
      description: field.description ?? undefined,
      type: field.type as Template['fields'][number]['type'],
      options: field.options ? parseJson<string[]>(field.options) : undefined,
      required: field.required,
      visibleInList: field.visibleInList,
      searchable: field.searchable,
      filterable: field.filterable,
      sortOrder: field.sortOrder,
    })),
  }
}

function mapMemo(memo: PrismaMemo) {
  return {
    id: memo.id,
    groupId: memo.groupId,
    templateId: memo.templateId,
    title: memo.title,
    values: parseJson<Record<string, MemoFieldValue>>(memo.values) ?? {},
    tagIds: memo.tags.map((tag) => tag.tagId),
    attachments: memo.attachments.map((attachment) => ({
      id: attachment.id,
      kind: attachment.kind as Attachment['kind'],
      memoId: attachment.memoId,
      name: attachment.name,
      url: attachment.url,
      size: attachment.size,
    })),
    createdBy: memo.createdBy,
    visibility: memo.visibility as Memo['visibility'],
    status: memo.status as Memo['status'],
    reactions: memo.reactions.map((reaction) => ({
      userId: reaction.userId,
      type: reaction.type as Memo['reactions'][number]['type'],
    })),
    comments: memo.comments.map((comment) => ({
      id: comment.id,
      memoId: comment.memoId,
      userId: comment.userId,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
    })),
    activity: memo.activity.map((activity) => ({
      id: activity.id,
      memoId: activity.memoId,
      userId: activity.userId,
      action: activity.action as Memo['activity'][number]['action'],
      detail: activity.detail,
      createdAt: activity.createdAt.toISOString(),
    })),
    viewCount: memo.viewCount,
    createdAt: memo.createdAt.toISOString(),
    updatedAt: memo.updatedAt.toISOString(),
  }
}

async function loadState(): Promise<BackendState> {
  await ensureSeeded()

  const [users, groups, templates, tags, memos, notifications, favoriteRecords] = await Promise.all([
    prisma.user.findMany(),
    prisma.group.findMany({ include: { members: true } }),
    prisma.template.findMany({ include: { fields: true } }),
    prisma.tag.findMany(),
    prisma.memo.findMany({
      include: {
        attachments: true,
        reactions: true,
        comments: true,
        activity: true,
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.favorite.findMany({ where: { userId: CURRENT_USER_ID } }),
  ])

  return {
    users: users.map((user) => ({
      ...user,
      avatarUrl: user.avatarUrl ?? undefined,
    })),
    groups: groups.map((group) => ({
      ...group,
      createdAt: group.createdAt.toISOString(),
      members: group.members.map((member) => ({
        groupId: member.groupId,
        userId: member.userId,
        role: member.role as Role,
        joinedAt: member.joinedAt.toISOString(),
      })),
    })),
    templates: templates.map(mapTemplate),
    memos: memos.map(mapMemo),
    tags,
    notifications: notifications.map((notification) => ({
      id: notification.id,
      type: notification.type as AppNotification['type'],
      title: notification.title,
      body: notification.body,
      createdAt: notification.createdAt.toISOString(),
      read: notification.read,
      memoId: notification.memoId ?? undefined,
    })),
    favorites: favoriteRecords.map((favorite) => favorite.memoId),
  }
}

export async function loginWithPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

  if (!user || !verifyPassword(password, user.password)) {
    throw new Error('メールアドレスまたはパスワードが正しくありません。')
  }

  return { userId: user.id }
}

export async function signUpWithPassword(input: { name: string; email: string; password: string }) {
  const trimmedName = input.name.trim()
  const normalizedEmail = input.email.trim().toLowerCase()

  if (!trimmedName) {
    throw new Error('表示名を入力してください。')
  }
  if (!normalizedEmail) {
    throw new Error('メールアドレスを入力してください。')
  }
  if (!input.password || input.password.length < 4) {
    throw new Error('パスワードは4文字以上で入力してください。')
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    throw new Error('このメールアドレスはすでに登録されています。')
  }

  const created = await prisma.user.create({
    data: {
      id: nextId('u'),
      name: trimmedName,
      email: normalizedEmail,
      password: hashPassword(input.password),
      avatarUrl: '/placeholder-user.jpg',
    },
  })

  return { userId: created.id }
}

export async function getServerState(): Promise<BackendState> {
  return loadState()
}

export async function applyBackendAction(action: BackendAction): Promise<BackendActionResponse> {
  await ensureSeeded()

  switch (action.type) {
    case 'toggleReaction': {
      const { memoId, type } = action.payload
      const existing = await prisma.reaction.findFirst({
        where: { memoId, userId: CURRENT_USER_ID, type },
      })

      if (existing) {
        await prisma.reaction.delete({ where: { id: existing.id } })
      } else {
        await prisma.reaction.create({
          data: {
            id: nextId('r'),
            memoId,
            userId: CURRENT_USER_ID,
            type,
          },
        })
      }
      break
    }

    case 'addComment': {
      const { memoId, body } = action.payload
      await prisma.comment.create({
        data: {
          id: nextId('c'),
          memoId,
          userId: CURRENT_USER_ID,
          body,
          createdAt: nowISO(),
        },
      })
      await prisma.activityLog.create({
        data: {
          id: nextId('l'),
          memoId,
          userId: CURRENT_USER_ID,
          action: 'commented',
          detail: 'コメントを追加しました',
          createdAt: nowISO(),
        },
      })
      await prisma.memo.update({ where: { id: memoId }, data: { updatedAt: nowISO() } })
      break
    }

    case 'toggleFavorite': {
      const { memoId } = action.payload
      const existing = await prisma.favorite.findUnique({
        where: { memoId_userId: { memoId, userId: CURRENT_USER_ID } },
      })

      if (existing) {
        await prisma.favorite.delete({
          where: { memoId_userId: { memoId, userId: CURRENT_USER_ID } },
        })
      } else {
        await prisma.favorite.create({
          data: {
            memoId,
            userId: CURRENT_USER_ID,
          },
        })
      }
      break
    }

    case 'createMemo': {
      const { id = nextId('m'), ...input } = action.payload
      const template = await prisma.template.findUnique({ where: { id: input.templateId } })
      const groupId = template?.groupId ?? ''

      await prisma.memo.create({
        data: {
          id,
          groupId,
          templateId: input.templateId,
          title: input.title,
          values: JSON.stringify(input.values),
          createdBy: CURRENT_USER_ID,
          visibility: input.visibility,
          status: 'published',
          viewCount: 0,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        },
      })

      if (input.tagIds.length > 0) {
        await prisma.memoTag.createMany({
          data: input.tagIds.map((tagId) => ({ memoId: id, tagId })),
        })
      }

      await prisma.activityLog.create({
        data: {
          id: nextId('l'),
          memoId: id,
          userId: CURRENT_USER_ID,
          action: 'created',
          detail: 'メモを作成しました',
          createdAt: nowISO(),
        },
      })

      return { state: await loadState(), result: { id } }
    }

    case 'updateMemo': {
      const { memoId, input } = action.payload

      await prisma.memo.update({
        where: { id: memoId },
        data: {
          title: input.title,
          values: JSON.stringify(input.values),
          visibility: input.visibility,
          updatedAt: nowISO(),
        },
      })

      await prisma.memoTag.deleteMany({ where: { memoId } })
      if (input.tagIds.length > 0) {
        await prisma.memoTag.createMany({
          data: input.tagIds.map((tagId) => ({ memoId, tagId })),
        })
      }

      await prisma.activityLog.create({
        data: {
          id: nextId('l'),
          memoId,
          userId: CURRENT_USER_ID,
          action: 'edited',
          detail: 'メモを編集しました',
          createdAt: nowISO(),
        },
      })
      break
    }

    case 'createGroup': {
      const { id = nextId('g'), inviteCode, ...input } = action.payload
      const normalizedInviteCode = inviteCode ?? `G-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      const safeInviteCode = normalizedInviteCode

      await prisma.group.create({
        data: {
          id,
          name: input.name,
          description: input.description,
          icon: input.icon,
          color: input.color,
          ownerId: CURRENT_USER_ID,
          inviteCode: safeInviteCode,
          createdAt: nowISO(),
        },
      })
      await prisma.groupMember.create({
        data: {
          groupId: id,
          userId: CURRENT_USER_ID,
          role: 'owner',
          joinedAt: nowISO(),
        },
      })

      return { state: await loadState(), result: { id } }
    }

    case 'joinGroup': {
      const { inviteCode } = action.payload
      const normalized = inviteCode.trim().toUpperCase()
      const group = await prisma.group.findFirst({
        where: { inviteCode: normalized },
      })
      if (!group) {
        return { state: await loadState(), result: { groupId: null } }
      }

      const existingMembership = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: group.id, userId: CURRENT_USER_ID } },
      })
      if (!existingMembership) {
        await prisma.groupMember.create({
          data: {
            groupId: group.id,
            userId: CURRENT_USER_ID,
            role: 'member',
            joinedAt: nowISO(),
          },
        })
      }

      return { state: await loadState(), result: { groupId: group.id } }
    }

    case 'createTemplate': {
      const { id = nextId('t'), ...input } = action.payload
      await prisma.template.create({
        data: {
          id,
          groupId: input.groupId,
          name: input.name,
          description: input.description,
          icon: input.icon,
          createdBy: CURRENT_USER_ID,
          createdAt: nowISO(),
        },
      })

      await prisma.templateField.createMany({
        data: input.fields.map((field) => ({
          id: field.id,
          templateId: id,
          name: field.name,
          description: field.description ?? null,
          type: field.type,
          options: field.options ? JSON.stringify(field.options) : null,
          required: field.required,
          visibleInList: field.visibleInList,
          searchable: field.searchable,
          filterable: field.filterable,
          sortOrder: field.sortOrder,
        })),
      })

      return { state: await loadState(), result: { id } }
    }

    case 'updateTemplate': {
      const { templateId, input } = action.payload
      await prisma.template.update({
        where: { id: templateId },
        data: {
          groupId: input.groupId,
          name: input.name,
          description: input.description,
          icon: input.icon,
        },
      })
      await prisma.templateField.deleteMany({ where: { templateId } })
      await prisma.templateField.createMany({
        data: input.fields.map((field) => ({
          id: field.id,
          templateId,
          name: field.name,
          description: field.description ?? null,
          type: field.type,
          options: field.options ? JSON.stringify(field.options) : null,
          required: field.required,
          visibleInList: field.visibleInList,
          searchable: field.searchable,
          filterable: field.filterable,
          sortOrder: field.sortOrder,
        })),
      })
      break
    }

    case 'archiveMemo': {
      const { memoId } = action.payload
      await prisma.memo.update({
        where: { id: memoId },
        data: {
          status: 'archived',
          updatedAt: nowISO(),
        },
      })
      await prisma.activityLog.create({
        data: {
          id: nextId('l'),
          memoId,
          userId: CURRENT_USER_ID,
          action: 'archived',
          detail: 'メモをアーカイブしました',
          createdAt: nowISO(),
        },
      })
      break
    }

    case 'markNotificationsRead': {
      await prisma.notification.updateMany({ data: { read: true } })
      break
    }

    default:
      throw new Error(`Unknown backend action type: ${(action as BackendAction).type}`)
  }

  return { state: await loadState() }
}
