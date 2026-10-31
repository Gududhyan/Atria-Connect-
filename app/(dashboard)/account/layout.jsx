import { requirePageRole } from '@/lib/session'

export default async function AccountLayout({ children }) {
  await requirePageRole('account')
  return children
}
