import { NextResponse } from 'next/server'
import { getServerState } from '@/lib/server-db'

export async function GET() {
  const state = await getServerState()
  return NextResponse.json(state)
}
