import { NextResponse } from 'next/server'
import { BRANCHES, SEMESTERS, SECTIONS, FACULTY_POOL, REMARKS_OPTIONS, PLACEMENT_OPTIONS } from '@/lib/constants'

// Domain constants never change at runtime, so this response is cached for an hour
// instead of being recomputed per request.
export const revalidate = 3600

export function GET() {
  return NextResponse.json({
    branches: BRANCHES,
    semesters: SEMESTERS,
    sections: SECTIONS,
    facultyPool: FACULTY_POOL,
    remarksOptions: REMARKS_OPTIONS,
    placementOptions: PLACEMENT_OPTIONS
  })
}
