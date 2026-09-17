import { NextResponse } from 'next/server'
import { applyBackendAction } from '@/lib/server-db'
import type { BackendAction } from '@/lib/api-types'

export async function POST(request: Request) {
  const action = (await request.json()) as BackendAction
  const response = await applyBackendAction(action)
  return NextResponse.json(response)
}
