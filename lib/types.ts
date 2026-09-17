// GroupNote ドメイン型定義
// 仕様書 20章「データモデル」に対応。MVP のコア体験に必要な範囲を型として定義する。

export type Role = 'owner' | 'member'

export type FieldType =
  | 'short_text' // 短文
  | 'long_text' // 長文
  | 'number' // 数値
  | 'single_select' // 単一選択
  | 'multi_select' // 複数選択
  | 'rating' // 評価（5段階）
  | 'date' // 日付
  | 'url' // URL
  | 'image' // 画像
  | 'file' // ファイル
  | 'checkbox' // チェックボックス

export type Visibility = 'group' | 'private'
export type MemoStatus = 'published' | 'archived'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface GroupMember {
  userId: string
  role: Role
  joinedAt: string
}

export interface Group {
  id: string
  name: string
  description: string
  icon: string // 絵文字1文字（アイコン代わり）
  color: string // アクセント色 (oklch/hex)
  ownerId: string
  members: GroupMember[]
  inviteCode: string
  createdAt: string
}

export interface TemplateField {
  id: string
  name: string
  description?: string
  type: FieldType
  options?: string[] // single_select / multi_select 用
  required: boolean
  visibleInList: boolean
  searchable: boolean
  filterable: boolean
  sortOrder: number
}

export interface Template {
  id: string
  groupId: string
  name: string
  description: string
  icon: string
  fields: TemplateField[]
  createdBy: string
  createdAt: string
}

// フィールド値。type に応じて使う値が変わる。
export type MemoFieldValue = string | number | boolean | string[] | null

export interface Attachment {
  id: string
  kind: 'image' | 'pdf'
  name: string
  url: string
  size: number // bytes
}

export interface Comment {
  id: string
  memoId: string
  userId: string
  body: string
  createdAt: string
}

export type ReactionType =
  | 'helpful' // 参考になった
  | 'saved' // 保存した
  | 'wanna_go' // 行きたい
  | 'checked' // 確認した
  | 'experienced' // 自分も体験した

export interface Reaction {
  userId: string
  type: ReactionType
}

export type ActivityAction =
  | 'created'
  | 'edited'
  | 'file_added'
  | 'tag_changed'
  | 'archived'
  | 'commented'

export interface ActivityLog {
  id: string
  memoId: string
  userId: string
  action: ActivityAction
  detail: string
  createdAt: string
}

export interface Memo {
  id: string
  groupId: string
  templateId: string
  title: string
  values: Record<string, MemoFieldValue> // fieldId -> value
  tagIds: string[]
  attachments: Attachment[]
  createdBy: string
  visibility: Visibility
  status: MemoStatus
  reactions: Reaction[]
  comments: Comment[]
  activity: ActivityLog[]
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  groupId: string
  name: string
  color: string
}

export interface AppNotification {
  id: string
  type: 'invite' | 'comment' | 'mention' | 'memo_update'
  title: string
  body: string
  createdAt: string
  read: boolean
  memoId?: string
}

export const REACTION_META: Record<ReactionType, { label: string; emoji: string }> = {
  helpful: { label: '参考になった', emoji: '👍' },
  saved: { label: '保存した', emoji: '🔖' },
  wanna_go: { label: '行きたい', emoji: '✋' },
  checked: { label: '確認した', emoji: '✅' },
  experienced: { label: '体験した', emoji: '⭐' },
}

export const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  short_text: '短文',
  long_text: '長文',
  number: '数値',
  single_select: '単一選択',
  multi_select: '複数選択',
  rating: '評価',
  date: '日付',
  url: 'URL',
  image: '画像',
  file: 'ファイル',
  checkbox: 'チェックボックス',
}
