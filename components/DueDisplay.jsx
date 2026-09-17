import Badge from './Badge'

export default function DueDisplay({ value }) {
  if (value === null || value === undefined) return <Badge type="neutral">N/A</Badge>
  if (value === 0) return <Badge type="ok">Cleared</Badge>
  return <Badge type="no">Not Cleared — ₹{value.toLocaleString()}</Badge>
}
