import { requirePageRole } from '@/lib/session'

export default async function AdminLayout({ children }) {
  await requirePageRole('admin')
  return children
}
