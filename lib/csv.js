export function parseCSV(text) {
  if (!text) return { headers: [], rows: [] }

  // Strip UTF-8 Byte Order Mark (BOM) if present from Excel
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1)
  }

  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return { headers: [], rows: [] }

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map((line) => {
    const values = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') { inQuotes = !inQuotes; continue }
      if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue }
      current += ch
    }
    values.push(current.trim())

    const obj = {}
    headers.forEach((h, i) => {
      const val = (values[i] ?? '').replace(/^"|"$/g, '').trim()
      obj[h] = val
      // Add case-insensitive and whitespace-stripped keys for flexible access
      const lower = h.toLowerCase()
      obj[lower] = val
      obj[lower.replace(/[\s_-]/g, '')] = val
    })
    return obj
  })

  return { headers, rows }
}
