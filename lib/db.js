import mongoose from 'mongoose'

// Serverless functions are stateless and cold-start often, so the connection is
// cached on `global` to be reused across warm invocations (and across dev hot reloads).
let cached = global._mongooseCache
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null }
}

// The JSON-file data store (with its well-known default passwords) is a dev
// convenience only. In production a missing/unreachable database must fail
// closed instead of silently serving that store.
export function isLocalDataAllowed() {
  return process.env.NODE_ENV !== 'production' || process.env.ALLOW_LOCAL_DATA === 'true'
}

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      console.warn('[db] MONGODB_URI is not set.')
      return null
    }

    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 2500
      })
      .then((m) => {
        console.log('[db] Connected to MongoDB')
        return m.connection
      })
      .catch((err) => {
        console.warn(`[db] Could not connect to MongoDB (${err.code || err.message}).`)
        return null
      })
  }

  cached.conn = await cached.promise
  // Don't let one failed attempt pin this instance to "no database" forever.
  if (!cached.conn) cached.promise = null

  return cached.conn
}

/**
 * Returns the live connection, or null when the caller should use the local
 * JSON store. Throws a 503 when there is no database and local mode is off.
 */
export async function connectOrLocal() {
  const conn = await connectDB().catch(() => null)
  if (conn) return conn
  if (isLocalDataAllowed()) return null

  const error = new Error('Database is unavailable. Please try again shortly.')
  error.status = 503
  throw error
}
