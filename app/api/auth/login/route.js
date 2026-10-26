import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { signToken, cookieOptions, COOKIE_NAME } from '@/lib/auth'
import { getLocalUserByUsername, getLocalUserByUsn } from '@/lib/local-store'
import User from '@/models/User'
import '@/models/Student'

export async function POST(request) {
  try {
    const { role, usn, username, password } = await request.json()

    if (!role || !password) {
      return NextResponse.json({ message: 'Role and password are required' }, { status: 400 })
    }

    const conn = await connectDB().catch(() => null)

    let user
    if (!conn) {
      user = role === 'student'
        ? getLocalUserByUsn(usn)
        : getLocalUserByUsername(role, username)
    } else {
      if (role === 'student') {
        if (!usn) {
          return NextResponse.json({ message: 'USN is required for student login' }, { status: 400 })
        }
        user = await User.findOne({ role: 'student', usn: usn.toUpperCase() }).populate('student')
      } else {
        if (!username) {
          return NextResponse.json({ message: 'Username is required for staff login' }, { status: 400 })
        }
        user = await User.findOne({ role, username: username.toLowerCase() })
      }
    }

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

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
