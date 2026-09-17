import { NextResponse } from 'next/server'
import { loginWithPassword, signUpWithPassword } from '@/lib/server-db'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { action?: 'login' | 'signup'; email?: string; password?: string; name?: string }

    if (body.action === 'login') {
      const result = await loginWithPassword(body.email ?? '', body.password ?? '')
      return NextResponse.json({ userId: result.userId })
    }

    if (body.action === 'signup') {
      const result = await signUpWithPassword({
        name: body.name ?? '',
        email: body.email ?? '',
        password: body.password ?? '',
      })
      return NextResponse.json({ userId: result.userId })
    }

    return NextResponse.json({ error: '不正な認証アクションです。' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : '認証に失敗しました。'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
