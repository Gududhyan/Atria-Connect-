import { requirePageRole } from '@/lib/session'

export default async function FacultyLayout({ children }) {
  await requirePageRole('faculty')
  return children
}
