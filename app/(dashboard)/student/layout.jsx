import { requirePageRole } from '@/lib/session'

export default async function StudentLayout({ children }) {
  await requirePageRole('student')
  return children
}
