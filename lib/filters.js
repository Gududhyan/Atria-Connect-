// Dashboard filters live in the URL (?sem=&branch=&section=) so the server can
// query only the matching students instead of loading the whole collection.
export function parseFilters(searchParams = {}) {
  return {
    sem: Number(searchParams.sem) || 1,
    branch: searchParams.branch || '',
    section: searchParams.section || ''
  }
}

export function toQuery({ sem, branch, section }) {
  return { semester: sem, branchCode: branch || undefined, section: section || undefined }
}
