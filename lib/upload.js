import 'server-only'
import { put } from '@vercel/blob'

// Vercel caps serverless request bodies at ~4.5MB, so reject earlier with a clear message.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

// Only formats a clearance proof needs. Anything renderable as active content
// (HTML, SVG, XML…) is refused so an upload can never become stored XSS.
const ALLOWED_TYPES = {
  pdf: { mime: 'application/pdf', magic: (b) => b.subarray(0, 5).toString('latin1') === '%PDF-' },
  png: { mime: 'image/png', magic: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  jpg: { mime: 'image/jpeg', magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  jpeg: { mime: 'image/jpeg', magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  webp: { mime: 'image/webp', magic: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' }
}

function uploadError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

export async function storeUpload(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw uploadError(400, 'No file uploaded')
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw uploadError(413, 'File is too large (4MB maximum)')
  }

  const originalName = String(file.name || 'document')
  const ext = originalName.split('.').pop().toLowerCase()
  const type = ALLOWED_TYPES[ext]
  const bytes = Buffer.from(await file.arrayBuffer())

  // Check the actual content, not just the name the browser sent.
  if (!type || !type.magic(bytes)) {
    throw uploadError(415, 'Only PDF, PNG, JPG or WEBP files are allowed')
  }

  const base = originalName.slice(0, -(ext.length + 1)).replace(/[^\w.-]+/g, '-').slice(0, 80) || 'document'
  const safeName = `${Date.now()}-${base}.${ext}`

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`documents/${safeName}`, bytes, {
      access: 'public',
      contentType: type.mime,
      // Public blobs are reachable by anyone holding the URL, so make it unguessable.
      addRandomSuffix: true
    })
    return { url: blob.url, name: originalName.slice(0, 200) }
  }

  // Local-dev convenience: without a Blob token, keep files under public/ so the
  // upload flow is still testable before a Blob store is provisioned.
  if (process.env.NODE_ENV === 'production') {
    throw uploadError(500, 'File storage is not configured (BLOB_READ_WRITE_TOKEN missing)')
  }

  const { writeFile, mkdir } = await import('node:fs/promises')
  const path = await import('node:path')
  const { randomUUID } = await import('node:crypto')
  const dir = path.join(process.cwd(), 'public', 'uploads')
  const localName = `${randomUUID()}-${safeName}`
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, localName), bytes)

  return { url: `/uploads/${localName}`, name: originalName.slice(0, 200) }
}
