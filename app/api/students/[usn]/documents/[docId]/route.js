import { handler, readJson, assertOwnUsn } from '@/lib/route-helpers'
import { reviewDocument, removeDocument } from '@/lib/data/students'

// Faculty/CC/Admin accept or reject an uploaded document, with a reason on reject.
export const PATCH = handler(
  ['faculty', 'cc', 'admin'],
  async ({ request, user, params }) => {
    const { status, reason } = await readJson(request)
    return reviewDocument(params.usn, params.docId, { status, reason, reviewedBy: user.name })
  },
  { revalidate: true }
)

export const DELETE = handler(
  ['student', 'admin'],
  async ({ user, params }) => {
    assertOwnUsn(user, params.usn)
    return removeDocument(params.usn, params.docId)
  },
  { revalidate: true }
)
