import mongoose from 'mongoose'

// Serverless functions are stateless and cold-start often, so the connection is
// cached on `global` to be reused across warm invocations (and across dev hot reloads).
let cached = global._mongooseCache
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      console.warn('[db] MONGODB_URI is not set. Running in local data mode.')
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
        console.warn(`[db] Could not connect to MongoDB (${err.code || err.message}). Running in local data mode.`)
        return null
      })
  }

  try {
    cached.conn = await cached.promise
  } catch {
    cached.promise = null
    cached.conn = null
  }

  return cached.conn
}
