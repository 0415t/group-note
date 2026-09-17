import type { AppNotification, Group, Memo, Tag, Template, User } from './types'
import type { NewMemoInput } from './store'

export interface BackendState {
  users: User[]
  groups: Group[]
  templates: Template[]
  memos: Memo[]
  tags: Tag[]
  notifications: AppNotification[]
  favorites: string[]
}

export type CreateMemoPayload = NewMemoInput & { id?: string }
export type UpdateMemoPayload = {
  memoId: string
  input: Omit<NewMemoInput, 'templateId'>
}
export type CreateGroupPayload = {
  id?: string
  inviteCode?: string
  name: string
  description: string
  icon: string
  color: string
}
export type JoinGroupPayload = {
  inviteCode: string
}
export type CreateTemplatePayload = Omit<Template, 'id' | 'createdAt' | 'createdBy'> & {
  id?: string
}
export type UpdateTemplatePayload = {
  templateId: string
  input: Omit<Template, 'id' | 'createdAt' | 'createdBy'>
}

export type BackendAction =
  | { type: 'toggleReaction'; payload: { memoId: string; type: string } }
  | { type: 'addComment'; payload: { memoId: string; body: string } }
  | { type: 'toggleFavorite'; payload: { memoId: string } }
  | { type: 'createMemo'; payload: CreateMemoPayload }
  | { type: 'updateMemo'; payload: UpdateMemoPayload }
  | { type: 'createGroup'; payload: CreateGroupPayload }
  | { type: 'joinGroup'; payload: JoinGroupPayload }
  | { type: 'createTemplate'; payload: CreateTemplatePayload }
  | { type: 'updateTemplate'; payload: UpdateTemplatePayload }
  | { type: 'archiveMemo'; payload: { memoId: string } }
  | { type: 'markNotificationsRead'; payload: {} }

export interface BackendActionResponse<Result = unknown> {
  state: BackendState
  result?: Result
}
