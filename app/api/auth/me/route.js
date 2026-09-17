import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'

export async function GET() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  return NextResponse.json({ user })
}
