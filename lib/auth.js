import { SignJWT, jwtVerify } from 'jose'

// jose (not jsonwebtoken) so this module can also run in the Edge middleware runtime.
export const COOKIE_NAME = 'nodue_session'
export const MAX_AGE_SECONDS = 7 * 24 * 60 * 60

function secretKey() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey())
}

export async function verifyToken(token) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey())
    return payload
  } catch {
    return null
  }
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: MAX_AGE_SECONDS
}

export const ROLE_HOME = {
  admin: '/admin',
  account: '/account',
  cc: '/cc',
  faculty: '/faculty',
  student: '/student'
}
