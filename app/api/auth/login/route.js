import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { signToken, cookieOptions, COOKIE_NAME } from '@/lib/auth'
import User from '@/models/User'
import '@/models/Student'

export async function POST(request) {
  try {
    const { role, usn, username, password } = await request.json()

    if (!role || !password) {
      return NextResponse.json({ message: 'Role and password are required' }, { status: 400 })
    }

    await connectDB()

    let user
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
    return NextResponse.json({ message: 'Login failed. Please try again.' }, { status: 500 })
  }
}
