'use client'

import { useState, useEffect, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FACULTY_POOL, getSubjects, BRANCHES, SEMESTERS, SECTIONS } from '@/lib/constants'
import { updateFaculty, assignSectionFaculty } from '@/lib/api-client'
import SemBranchSectionSelector from '@/components/SemBranchSectionSelector'
import Badge from '@/components/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/ui/PageHeader'

export default function FacultyAssignmentClient({ students, sem, branch, section, search }) {
  const router = useRouter()
  const [selectedUsn, setSelectedUsn] = useState(null)
  const [savingCode, setSavingCode] = useState(null)
  const [savingSection, setSavingSection] = useState(false)
  const [sectionSuccess, setSectionSuccess] = useState('')
  const [error, setError] = useState('')
  const [, startTransition] = useTransition()

  const isSectionSelected = Boolean(sem && branch && section)

  // Get canonical curriculum subjects for selected sem and branch
  const curriculumSubjects = useMemo(() => {
    if (!sem || !branch) return []
    try {
      return getSubjects(Number(sem), branch)
    } catch {
      return []
    }
  }, [sem, branch])

  // Track section-level assignments: { [subjectCode]: facultyName }
  const [sectionAssignments, setSectionAssignments] = useState({})

  // Initialize section assignments when semester/branch/section or students change
  useEffect(() => {
    if (!isSectionSelected || curriculumSubjects.length === 0) {
      setSectionAssignments({})
      return
    }

    const initial = {}
    curriculumSubjects.forEach((sub, idx) => {
      // Check existing student assignments to prefill
      let foundFaculty = ''
      for (const st of students) {
        const matchingSub = (st.subjects || []).find((s) => s.code.toUpperCase() === sub.code.toUpperCase())
        if (matchingSub?.faculty) {
          foundFaculty = matchingSub.faculty
          break
        }
      }
      initial[sub.code] = foundFaculty || FACULTY_POOL[idx % FACULTY_POOL.length]
    })

    setSectionAssignments(initial)
    setSectionSuccess('')
    setError('')
  }, [sem, branch, section, curriculumSubjects, students, isSectionSelected])

  const handleAssignmentChange = (subjectCode, faculty) => {
    setSectionAssignments((prev) => ({
      ...prev,
      [subjectCode]: faculty
    }))
    setSectionSuccess('')
    setError('')
  }

  const handleAutoAssign = () => {
    const auto = {}
    curriculumSubjects.forEach((sub, idx) => {
      auto[sub.code] = FACULTY_POOL[idx % FACULTY_POOL.length]
    })
    setSectionAssignments(auto)
    setSectionSuccess('Faculty auto-distributed across subjects. Click "Apply to Section" to save.')
  }

  const handleApplyToSection = async () => {
    if (!isSectionSelected) return
    setError('')
    setSectionSuccess('')
    setSavingSection(true)

    // Check that each subject has a faculty selected
    const unassigned = curriculumSubjects.filter((s) => !sectionAssignments[s.code])
    if (unassigned.length > 0) {
      setError(`Please select a faculty for all subjects: ${unassigned.map((s) => s.code).join(', ')}`)
      setSavingSection(false)
      return
    }

    try {
      const res = await assignSectionFaculty({
        semester: Number(sem),
        branchCode: branch,
        section,
        assignments: sectionAssignments
      })
      setSectionSuccess(
        res.message || `Successfully assigned faculty to all ${students.length} students in Sem ${sem} ${branch}-${section}!`
      )
      startTransition(() => router.refresh())
    } catch (err) {
      setError(err.message || 'Failed to assign faculty to section')
    } finally {
      setSavingSection(false)
    }
  }

  // Individual student assignment handler (for fine-tuning exceptions)
  const assignIndividual = async (usn, subjectCode, faculty) => {
    setSavingCode(subjectCode)
    setError('')
    try {
      await updateFaculty(usn, subjectCode, faculty)
      startTransition(() => router.refresh())
    } catch (err) {
      setError(err.message || 'Failed to assign faculty')
    } finally {
      setSavingCode(null)
    }
  }

  const selected = students.find((s) => s.usn === selectedUsn) || null
  const branchObj = BRANCHES.find((b) => b.code === branch)
  const branchName = branchObj ? branchObj.short || branchObj.code : branch

  return (
    <div className="fade-in">
      <PageHeader
        title="Faculty Assignment"
        subtitle="Assign faculty to students by Semester, Branch, and Section for all subjects at once"
      />

      {/* Filter / Selector Bar */}
      <Card className="mb-6">
        <div className="p-4">
          <SemBranchSectionSelector sem={sem} branch={branch} section={section} search={search} />
        </div>
      </Card>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 fade-in">
          <i className="fas fa-circle-exclamation text-red-500 text-sm" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {sectionSuccess && (
        <div className="mb-4 p-3.5 bg-ok-light border border-ok/20 rounded-xl flex items-center gap-2.5 fade-in">
          <i className="fas fa-circle-check text-ok text-base" />
          <p className="text-sm text-ok font-semibold">{sectionSuccess}</p>
        </div>
      )}

      {/* SECTION-WIDE FACULTY ASSIGNMENT PANEL */}
      {isSectionSelected ? (
        <Card className="mb-6 border-atria/30 bg-gradient-to-br from-white via-slate-50/50 to-atria-pale/20 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-atria text-white flex items-center justify-center font-bold text-base shadow-sm shadow-atria/20">
                <i className="fas fa-chalkboard-user" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-800">
                    Assign Faculty to Section — Sem {sem} • {branchName} • Sec {section}
                  </h2>
                  <Badge type="info" size="sm">{students.length} Students</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select faculty for each course below. Changes apply to <strong>all {students.length} students</strong> in this section simultaneously.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAutoAssign}
                variant="secondary"
                size="sm"
                className="text-xs font-semibold px-3 py-2"
                title="Distribute faculty evenly across subjects"
              >
                <i className="fas fa-wand-magic-sparkles mr-1.5 text-atria" /> Auto-Fill
              </Button>
              <Button
                onClick={handleApplyToSection}
                disabled={savingSection || students.length === 0}
                variant="primary"
                size="sm"
                className="text-xs font-semibold px-4 py-2 shadow-sm shadow-atria/20"
              >
                {savingSection ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-1.5" /> Applying to Section…
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-double mr-1.5" /> Apply to All {students.length} Students
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="p-5">
            {curriculumSubjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {curriculumSubjects.map((sub) => (
                  <div
                    key={sub.code}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-atria/40 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {sub.code}
                        </span>
                        <Badge type={sub.type === 'lab' ? 'info' : 'default'} size="sm">
                          {sub.type}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate" title={sub.name}>
                        {sub.name}
                      </p>
                    </div>
                    <select
                      value={sectionAssignments[sub.code] || ''}
                      onChange={(e) => handleAssignmentChange(sub.code, e.target.value)}
                      className="w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:border-atria focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled>-- Assign Faculty --</option>
                      {FACULTY_POOL.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-slate-500">
                No predefined subjects found for this branch and semester.
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="mb-6 p-6 border-dashed border-2 border-slate-200 bg-slate-50/70 text-center">
          <div className="w-12 h-12 rounded-2xl bg-atria-pale text-atria mx-auto flex items-center justify-center text-xl mb-3 shadow-sm">
            <i className="fas fa-layer-group" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Assign Faculty by Section</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Select a <strong>Semester</strong>, <strong>Branch</strong>, and <strong>Section</strong> from the filter bar above to configure and assign faculty for the entire class at once.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Pick:</span>
            {SECTIONS.map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  const url = new URL(window.location.href)
                  if (!sem) url.searchParams.set('sem', '6')
                  if (!branch) url.searchParams.set('branch', 'CS')
                  url.searchParams.set('section', sec)
                  router.push(url.pathname + url.search)
                }}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:border-atria hover:text-atria transition-colors shadow-2xs"
              >
                Sem {sem || 6} {branch || 'CS'} - Sec {sec}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* ENROLLED STUDENTS TABLE */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-users text-slate-400 text-xs" />
            <p className="text-sm font-bold text-slate-700">
              Enrolled Students ({students.length})
              {search && <span className="font-normal text-slate-500"> matching &quot;{search}&quot;</span>}
            </p>
          </div>
          {isSectionSelected && (
            <span className="text-xs text-slate-500 font-medium">
              Sem {sem} • {branchName} • Section {section}
            </span>
          )}
        </div>

        <div className="max-h-[55vh] overflow-y-auto scrollbar-thin">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">USN</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Faculty Overview</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const totalSubjects = (s.subjects || []).length
                const assignedSubjects = (s.subjects || []).filter((sub) => Boolean(sub.faculty)).length
                const isFullyAssigned = totalSubjects > 0 && assignedSubjects === totalSubjects

                return (
                  <tr key={s.usn} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-slate-800">{s.usn}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{s.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-600">Sem {s.semester}</span>
                        <span className="text-xs text-slate-300">•</span>
                        <Badge type="info" size="sm">Sec {s.section}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isFullyAssigned ? (
                          <Badge type="success" size="sm">
                            <i className="fas fa-circle-check mr-1 text-[10px]" />
                            All {totalSubjects} Subjects Assigned
                          </Badge>
                        ) : assignedSubjects > 0 ? (
                          <Badge type="warning" size="sm">
                            <i className="fas fa-clock mr-1 text-[10px]" />
                            {assignedSubjects}/{totalSubjects} Subjects Assigned
                          </Badge>
                        ) : (
                          <Badge type="danger" size="sm">
                            <i className="fas fa-triangle-exclamation mr-1 text-[10px]" />
                            Faculty Not Assigned
                          </Badge>
                        )}
                        <span className="text-2xs text-slate-400 hidden xl:inline">
                          {(s.subjects || [])
                            .filter((sub) => sub.faculty)
                            .slice(0, 2)
                            .map((sub) => sub.faculty)
                            .join(', ')}
                          {assignedSubjects > 2 && '…'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        onClick={() => setSelectedUsn(s.usn)}
                        variant="secondary"
                        size="sm"
                        className="px-3 py-1.5 text-xs font-semibold"
                      >
                        <i className="fas fa-eye mr-1" /> View / Edit
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                    {search ? `No students found matching "${search}"` : 'No students match these filters'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* INDIVIDUAL STUDENT INSPECT / OVERRIDE MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 fade-in"
          onClick={() => setSelectedUsn(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800">Faculty Details for Student</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className="font-mono font-semibold text-slate-700">{selected.usn}</span> — {selected.name} (Sem {selected.semester} {selected.branchCode} Sec {selected.section})
                </p>
              </div>
              <button
                onClick={() => setSelectedUsn(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="fas fa-xmark text-sm" />
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto scrollbar-thin flex-1">
              <p className="text-xs text-slate-500 mb-2">
                Tip: You can change an individual subject faculty for this student here, or use the Section Assignment panel to update everyone in this class.
              </p>
              {(selected.subjects || []).map((sub) => (
                <div
                  key={sub.code}
                  className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{sub.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-2xs font-bold text-slate-500">{sub.code}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-2xs text-slate-400 capitalize">{sub.type}</span>
                    </div>
                  </div>
                  {savingCode === sub.code && <i className="fas fa-circle-notch fa-spin text-atria text-xs" />}
                  <select
                    value={sub.faculty || ''}
                    onChange={(e) => assignIndividual(selected.usn, sub.code, e.target.value)}
                    disabled={savingCode === sub.code}
                    className="w-48 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-60 focus:border-atria focus:outline-none"
                  >
                    <option value="" disabled>Unassigned</option>
                    {FACULTY_POOL.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <Button onClick={() => setSelectedUsn(null)} variant="secondary" size="sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
