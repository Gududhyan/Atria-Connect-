import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectOrLocal } from '@/lib/db'
import { signToken, cookieOptions, COOKIE_NAME, ROLE_HOME } from '@/lib/auth'
import { getLocalUserByUsername, getLocalUserByUsn } from '@/lib/local-store'
import User from '@/models/User'
import '@/models/Student'

// Compared against when the account doesn't exist, so a miss costs the same
// bcrypt work as a hit and response time doesn't reveal valid usernames/USNs.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser', 10)

// Best-effort brute-force throttle. Per-instance memory only, so on serverless it
// slows an attacker down rather than enforcing a hard global limit.
const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES = 10
const failures = new Map()

function clientKey(request, role, identifier) {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  return `${ip}|${role}|${identifier}`
}

function isThrottled(key) {
  const entry = failures.get(key)
  if (!entry) return false
  if (Date.now() - entry.first > WINDOW_MS) {
    failures.delete(key)
    return false
  }
  return entry.count >= MAX_FAILURES
}

function recordFailure(key) {
  const now = Date.now()
  const entry = failures.get(key)
  if (!entry || now - entry.first > WINDOW_MS) failures.set(key, { count: 1, first: now })
  else entry.count++
  if (failures.size > 10000) failures.clear()
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null)
    const { role, usn, username, password } = body || {}

    if (typeof role !== 'string' || !(role in ROLE_HOME) || typeof password !== 'string' || !password) {
      return NextResponse.json({ message: 'Role and password are required' }, { status: 400 })
    }

    const identifier = role === 'student' ? usn : username
    if (typeof identifier !== 'string' || !identifier.trim()) {
      const message = role === 'student' ? 'USN is required for student login' : 'Username is required for staff login'
      return NextResponse.json({ message }, { status: 400 })
    }
    const normalized = role === 'student' ? identifier.trim().toUpperCase() : identifier.trim().toLowerCase()

    const key = clientKey(request, role, normalized)
    if (isThrottled(key)) {
      return NextResponse.json(
        { message: 'Too many failed attempts. Please wait 15 minutes and try again.' },
        { status: 429 }
      )
    }

    const conn = await connectOrLocal()

    let user
    if (!conn) {
      user = role === 'student'
        ? getLocalUserByUsn(normalized)
        : getLocalUserByUsername(role, normalized)
    } else if (role === 'student') {
      user = await User.findOne({ role: 'student', usn: normalized }).populate('student')
    } else {
      user = await User.findOne({ role, username: normalized })
    }

    const valid = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH)
    if (!user || !valid) {
      recordFailure(key)
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }
    failures.delete(key)

    const token = await signToken({ userId: String(user._id), role: user.role })

    const response = NextResponse.json({
      user: {
        id: String(user._id),
        role: user.role,
        name: user.name,
        username: user.username || null,
        usn: user.usn || null
      }
    })

    response.cookies.set(COOKIE_NAME, token, cookieOptions)
    return response
  } catch (error) {
    if (error?.status === 503) {
      return NextResponse.json({ message: error.message }, { status: 503 })
    }
    console.error('[login]', error)
    const isDbError =
      error?.name === 'MongooseServerSelectionError' ||
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ENOTFOUND' ||
      error?.message?.includes('querySrv') ||
      error?.message?.includes('topology')
    const message = isDbError
      ? 'Database connection error: Could not connect to MongoDB. Please check your MONGODB_URI in .env or resume your cluster on cloud.mongodb.com.'
      : 'Login failed. Please try again.'
    return NextResponse.json({ message }, { status: 500 })
  }
}
