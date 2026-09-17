'use client'

import { useState, type FormEvent } from 'react'
import { NotebookPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'

export function LoginScreen() {
  const { loginWithPassword, signUp } = useStore()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('you@example.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    try {
      if (mode === 'login') {
        await loginWithPassword(email, password)
        return
      }

      await signUp({ name, email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました。')
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-primary/8 to-background">
      <div className="flex flex-1 flex-col justify-center px-6 pb-6 pt-16">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <NotebookPen className="size-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">GroupNote</h1>
          <p className="mt-2 max-w-xs text-pretty text-sm text-muted-foreground">
            グループごとに共通テンプレートを作り、メンバーが同じ形式で情報を残せる共有メモアプリ
          </p>
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <Field
              label="表示名"
              type="text"
              placeholder="山田 太郎"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <Field
            label="メールアドレス"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="パスワード"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {mode === 'login' && (
            <button type="button" className="self-end text-xs font-medium text-primary hover:underline">
              パスワードをお忘れですか？
            </button>
          )}

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-2 h-12 w-full text-sm font-bold">
            {mode === 'login' ? 'ログイン' : '同意して登録'}
          </Button>

          {mode === 'signup' && (
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              登録すると、利用規約とプライバシーポリシーに同意したものとみなされます。
            </p>
          )}
        </form>

        <div className="mt-6 flex items-center justify-center gap-1 text-sm">
          <span className="text-muted-foreground">
            {mode === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
          </span>
          <button
            type="button"
            onClick={() => {
              setError('')
              setMode(mode === 'login' ? 'signup' : 'login')
            }}
            className="font-bold text-primary hover:underline"
          >
            {mode === 'login' ? '新規登録' : 'ログイン'}
          </button>
        </div>

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          デモ用：そのままログインするとサンプルデータで体験できます
        </p>
      </div>
    </div>
  )
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <input
        {...props}
        className="h-12 rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-3 focus:ring-ring/30"
      />
    </label>
  )
}
