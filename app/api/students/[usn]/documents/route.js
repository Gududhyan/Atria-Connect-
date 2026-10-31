import { handler, assertOwnUsn } from '@/lib/route-helpers'
import { addDocument } from '@/lib/data/students'
import { storeUpload } from '@/lib/upload'

// Uploads the file to storage and records it on the student in one round trip.
export const POST = handler(
  ['student', 'admin'],
  async ({ request, user, params }) => {
    assertOwnUsn(user, params.usn)

    const formData = await request.formData()
    return addDocument(params.usn, () => storeUpload(formData.get('document')))
  },
  { revalidate: true }
)
