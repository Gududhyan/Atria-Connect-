import { BRANCHES, SEMESTERS, SECTIONS, FACULTY_POOL, REMARKS_OPTIONS, PLACEMENT_OPTIONS } from '../data/constants.js'

export function getMeta(req, res) {
  res.json({
    branches: BRANCHES,
    semesters: SEMESTERS,
    sections: SECTIONS,
    facultyPool: FACULTY_POOL,
    remarksOptions: REMARKS_OPTIONS,
    placementOptions: PLACEMENT_OPTIONS
  })
}
