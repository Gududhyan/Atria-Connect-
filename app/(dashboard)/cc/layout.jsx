import { requirePageRole } from '@/lib/session'

export default async function CcLayout({ children }) {
  await requirePageRole('cc')
  return children
}
