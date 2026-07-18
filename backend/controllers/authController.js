import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const createToken = (user) => {
  const secret = process.env.JWT_SECRET || 'no-dues-dev-secret'
  return jwt.sign({ userId: user._id, role: user.role }, secret, { expiresIn: '7d' })
}

export async function login(req, res, next) {
  try {
    const { role, usn, username, password } = req.body
    if (!role || !password) {
      return res.status(400).json({ message: 'Role and password are required' })
    }

    let user
    if (role === 'student') {
      if (!usn) {
        return res.status(400).json({ message: 'USN is required for student login' })
      }
      user = await User.findOne({ role: 'student', usn: usn.toUpperCase() }).populate('student')
    } else {
      // For staff roles, require username
      if (!username) {
        return res.status(400).json({ message: 'Username is required for staff login' })
      }
      user = await User.findOne({ role, username: username.toLowerCase() })
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = createToken(user)
    res.json({
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        username: user.username,
        usn: user.usn,
        student: user.student || null
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function me(req, res) {
  const user = req.user
  res.json({
    user: {
      id: user._id,
      role: user.role,
      name: user.name,
      usn: user.usn,
      student: user.student || null
    }
  })
}
