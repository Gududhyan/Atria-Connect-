// Dashboard filters live in the URL (?sem=&branch=&section=&search=) so the server can
// query only the matching students instead of loading the whole collection.
export function parseFilters(searchParams = {}) {
  const search = (searchParams.search || '').trim()
  const rawSem = searchParams.sem

  let sem = null
  if (rawSem !== undefined && rawSem !== '' && rawSem !== 'all') {
    const num = Number(rawSem)
    if (!Number.isNaN(num) && num > 0) {
      sem = num
    }
  } else if (!search && rawSem === undefined) {
    // Default to semester 1 on initial load without any query parameters
    sem = 1
  }

  return {
    sem,
    branch: searchParams.branch || '',
    section: searchParams.section || '',
    search
  }
}

export function toQuery({ sem, branch, section, search }) {
  return {
    semester: sem || undefined,
    branchCode: branch || undefined,
    section: section || undefined,
    search: search || undefined
  }
}
