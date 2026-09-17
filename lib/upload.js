import 'server-only'
import { put } from '@vercel/blob'

// Vercel caps serverless request bodies at ~4.5MB, so reject earlier with a clear message.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

export async function storeUpload(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    const error = new Error('No file uploaded')
    error.status = 400
    throw error
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    const error = new Error('File is too large (4MB maximum)')
    error.status = 413
    throw error
  }

  const safeName = `${Date.now()}-${String(file.name || 'document').replace(/[^\w.-]+/g, '-')}`

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`documents/${safeName}`, file, {
      access: 'public',
      addRandomSuffix: false
    })
    return { url: blob.url, name: file.name }
  }

  // Local-dev convenience: without a Blob token, keep files under public/ so the
  // upload flow is still testable before a Blob store is provisioned.
  if (process.env.NODE_ENV === 'production') {
    const error = new Error('File storage is not configured (BLOB_READ_WRITE_TOKEN missing)')
    error.status = 500
    throw error
  }

  const { writeFile, mkdir } = await import('node:fs/promises')
  const path = await import('node:path')
  const dir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, safeName), Buffer.from(await file.arrayBuffer()))

  return { url: `/uploads/${safeName}`, name: file.name }
}
