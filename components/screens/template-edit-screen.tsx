'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ScreenHeader } from '@/components/shared/primitives'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FIELD_TYPE_LABEL, type FieldType, type TemplateField } from '@/lib/types'

function createBlankField(index: number): TemplateField {
  return {
    id: `field_${Date.now()}_${index}`,
    name: '',
    type: 'short_text',
    required: false,
    visibleInList: true,
    searchable: true,
    filterable: false,
    sortOrder: index,
  }
}

export function TemplateEditScreen({ groupId, templateId }: { groupId: string; templateId?: string }) {
  const { getGroup, getTemplate, createTemplate, updateTemplate, goBack } = useStore()
  const group = getGroup(groupId)
  const existing = templateId ? getTemplate(templateId) : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [icon, setIcon] = useState(existing?.icon ?? '📝')
  const [fields, setFields] = useState<TemplateField[]>(() =>
    existing?.fields.map((field) => ({ ...field })) ?? [createBlankField(0)],
  )
  const [error, setError] = useState('')

  if (!group) return null

  const updateField = (index: number, patch: Partial<TemplateField>) => {
    setFields((prev) =>
      prev.map((field, fieldIndex) => {
        if (fieldIndex !== index) return field
        const nextField = { ...field, ...patch }
        if (patch.type && !['single_select', 'multi_select'].includes(patch.type)) {
          const { options, ...rest } = nextField
          return rest
        }
        if (patch.type && ['single_select', 'multi_select'].includes(patch.type) && !nextField.options) {
          return { ...nextField, options: [''] }
        }
        return nextField
      }),
    )
  }

  const addField = () => {
    setFields((prev) => [...prev, createBlankField(prev.length)])
  }

  const removeField = (index: number) => {
    setFields((prev) => {
      if (prev.length === 1) return prev
      return prev.filter((_, fieldIndex) => fieldIndex !== index).map((field, fieldIndex) => ({ ...field, sortOrder: fieldIndex }))
    })
  }

  const addOption = (fieldIndex: number) => {
    setFields((prev) =>
      prev.map((field, index) =>
        index === fieldIndex
          ? { ...field, options: [...(field.options ?? []), ''] }
          : field,
      ),
    )
  }

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    setFields((prev) =>
      prev.map((field, index) => {
        if (index !== fieldIndex) return field
        return {
          ...field,
          options: field.options?.map((option, idx) => (idx === optionIndex ? value : option)),
        }
      }),
    )
  }

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    setFields((prev) =>
      prev.map((field, index) => {
        if (index !== fieldIndex) return field
        const nextOptions = field.options?.filter((_, idx) => idx !== optionIndex) ?? []
        return {
          ...field,
          options: nextOptions.length > 0 ? nextOptions : [''],
        }
      }),
    )
  }

  const handleSave = () => {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()
    const trimmedIcon = icon.trim() || '📝'

    if (!trimmedName) {
      setError('テンプレート名を入力してください。')
      return
    }

    const normalizedFields = fields.map((field, index) => ({
      ...field,
      name: field.name.trim(),
      sortOrder: index,
    }))

    if (normalizedFields.some((field) => !field.name)) {
      setError('項目名を入力してください。')
      return
    }

    if (templateId) {
      updateTemplate(templateId, {
        groupId,
        name: trimmedName,
        description: trimmedDescription,
        icon: trimmedIcon,
        fields: normalizedFields,
      })
    } else {
      createTemplate({
        groupId,
        name: trimmedName,
        description: trimmedDescription,
        icon: trimmedIcon,
        fields: normalizedFields,
      })
    }

    goBack()
  }

  return (
    <div className="flex min-h-full flex-col pb-24">
      <ScreenHeader title={templateId ? 'テンプレートを編集' : 'テンプレートを追加'} />

      <div className="flex flex-col gap-4 px-4 pt-4">
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground">テンプレート名</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：おすすめ飲食店"
            className="h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-ring/30"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground">説明</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="このテンプレートで何を共有するかを入力"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed outline-none focus:border-primary focus:ring-3 focus:ring-ring/30"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground">アイコン</span>
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            maxLength={2}
            placeholder="📝"
            className="h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-ring/30"
          />
        </label>

        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">入力項目</p>
              <p className="text-xs text-muted-foreground">テンプレートごとに登録する項目を設定します。</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={addField}>
              <Plus className="size-3.5" /> 追加
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-xl border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">項目 {index + 1}</p>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => removeField(index)} className="text-xs font-medium text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-foreground">項目名</span>
                    <input
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      placeholder="例：店名"
                      className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-ring/30"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-foreground">形式</span>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                      className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-ring/30"
                    >
                      {Object.entries(FIELD_TYPE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {['single_select', 'multi_select'].includes(field.type) && (
                  <div className="mt-3 space-y-2 rounded-2xl border border-border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">選択肢</p>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary"
                        onClick={() => addOption(index)}
                      >
                        + 追加
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(field.options ?? []).map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            value={option}
                            onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                            placeholder="選択肢を入力"
                            className="flex-1 h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-ring/30"
                          />
                          <button
                            type="button"
                            className="text-xs text-destructive"
                            onClick={() => removeOption(index, optionIndex)}
                          >
                            削除
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <label className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                    />
                    必須
                  </label>
                  <label className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
                    <input
                      type="checkbox"
                      checked={field.visibleInList}
                      onChange={(e) => updateField(index, { visibleInList: e.target.checked })}
                    />
                    一覧表示
                  </label>
                  <label className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
                    <input
                      type="checkbox"
                      checked={field.searchable}
                      onChange={(e) => updateField(index, { searchable: e.target.checked })}
                    />
                    検索対象
                  </label>
                  <label className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
                    <input
                      type="checkbox"
                      checked={field.filterable}
                      onChange={(e) => updateField(index, { filterable: e.target.checked })}
                    />
                    絞り込み
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[440px] gap-2 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-md">
        <Button variant="outline" className="h-12 flex-1" onClick={goBack}>
          キャンセル
        </Button>
        <Button className="h-12 flex-[2] font-bold" onClick={handleSave}>
          {templateId ? '保存する' : 'テンプレートを作成'}
        </Button>
      </div>
    </div>
  )
}
