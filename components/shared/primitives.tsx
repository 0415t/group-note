'use client'

import { Star, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import type { Tag, User } from '@/lib/types'

const AVATAR_COLORS = [
  'oklch(0.63 0.19 27)',
  'oklch(0.55 0.14 260)',
  'oklch(0.6 0.12 160)',
  'oklch(0.72 0.14 70)',
  'oklch(0.65 0.15 330)',
]

function colorFor(id: string) {
  let sum = 0
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

export function Avatar({
  user,
  size = 32,
  className,
}: {
  user?: User
  size?: number
  className?: string
}) {
  const initial = user?.name?.charAt(0) ?? '?'
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: colorFor(user?.id ?? 'x'),
        fontSize: size * 0.42,
      }}
      aria-hidden="true"
    >
      {initial}
    </div>
  )
}

export function RatingStars({
  value,
  size = 16,
  className,
}: {
  value: number
  size?: number
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`評価 ${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(
            i <= value ? 'fill-[oklch(0.72_0.14_70)] text-[oklch(0.72_0.14_70)]' : 'fill-muted text-muted-foreground/40',
          )}
        />
      ))}
    </div>
  )
}

export function TagChip({ tag, small }: { tag: Tag; small?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        small ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      )}
      style={{
        color: tag.color,
        backgroundColor: `color-mix(in oklch, ${tag.color} 14%, transparent)`,
      }}
    >
      #{tag.name}
    </span>
  )
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  showBack = true,
}: {
  title: string
  subtitle?: string
  right?: React.ReactNode
  showBack?: boolean
}) {
  const { goBack } = useStore()
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/85 px-3 py-3 backdrop-blur-md">
      {showBack && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={goBack}
          aria-label="戻る"
        >
          <ChevronLeft className="size-5" />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold leading-tight text-foreground">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 pb-2 pt-5">
      <h2 className="text-sm font-bold tracking-tight text-foreground">{children}</h2>
      {action}
    </div>
  )
}

export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>}
    </div>
  )
}
