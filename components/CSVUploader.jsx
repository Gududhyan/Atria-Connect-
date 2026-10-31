'use client'

import { useState, useRef } from 'react'
import { parseCSV } from '@/lib/csv'
import Badge from './Badge'

const COLUMN_ALIASES = {
  USN: ['usn', 'rollno', 'roll_no', 'rollnumber', 'roll_number', 'regno', 'reg_no', 'id', 'studentid', 'student_id'],
  Name: ['name', 'studentname', 'student_name', 'fullname', 'full_name'],
  BranchCode: ['branchcode', 'branch_code', 'branch', 'dept', 'department', 'course'],
  Semester: ['semester', 'sem', 'term'],
  Section: ['section', 'sec'],
  Password: ['password', 'pwd', 'pass'],
  Placement: ['placement', 'status', 'placementstatus', 'job_status'],
  SubjectCode: ['subjectcode', 'subject_code', 'code', 'subject', 'subcode'],
  Faculty: ['faculty', 'facultyname', 'faculty_name', 'teacher', 'professor', 'instructor'],
  HostelDue: ['hosteldue', 'hostel_due', 'hostel'],
  LibraryDue: ['librarydue', 'library_due', 'library'],
  FeesDue: ['feesdue', 'fees_due', 'fees', 'fee', 'collegedue', 'tuitiondue']
}

const OPTIONAL_COLUMNS = new Set(['Password', 'Placement'])

function findHeaderMatch(expectedCol, headers) {
  const normExpected = expectedCol.toLowerCase().replace(/[^a-z0-9]/g, '')
  const aliases = (COLUMN_ALIASES[expectedCol] || []).map((a) => a.toLowerCase().replace(/[^a-z0-9]/g, ''))
  aliases.push(normExpected)

  return headers.find((h) => {
    const normH = String(h).toLowerCase().replace(/[^a-z0-9]/g, '')
    return aliases.includes(normH)
  })
}

export default function CSVUploader({ title, description, columns, sampleCSV, onUpload, acceptText }) {
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [warning, setWarning] = useState('')
  const fileRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError(''); setSuccess(''); setWarning(''); setPreview(null)

    if (!file.name.toLowerCase().endsWith('.csv')) { setError('Please upload a .csv file'); return }

    const reader = new FileReader()
    reader.onload = (evt) => {
      const content = evt.target.result
      const { headers, rows } = parseCSV(content)
      if (rows.length === 0) { setError('CSV file is empty or has no data rows'); return }

      // Check required vs optional columns with aliases
      const columnMapping = {}
      const missing = []

      for (const col of columns) {
        const matchedHeader = findHeaderMatch(col, headers)
        if (matchedHeader) {
          columnMapping[col] = matchedHeader
        } else if (!OPTIONAL_COLUMNS.has(col)) {
          missing.push(col)
        }
      }

      if (missing.length > 0) {
        setError(`Missing required columns: ${missing.join(', ')}`)
        return
      }

      // Map rows with canonical column names
      const normalizedRows = rows.map((r) => {
        const rowObj = { ...r }
        for (const [canonicalCol, actualHeader] of Object.entries(columnMapping)) {
          const val = r[actualHeader]
          rowObj[canonicalCol] = val
          rowObj[canonicalCol.toLowerCase()] = val
          if (canonicalCol === 'BranchCode') {
            rowObj.branchCode = val
            rowObj.branch = val
          }
          if (canonicalCol === 'SubjectCode') {
            rowObj.subjectCode = val
          }
          if (canonicalCol === 'HostelDue') rowObj.hostelDue = val
          if (canonicalCol === 'LibraryDue') rowObj.libraryDue = val
          if (canonicalCol === 'FeesDue') rowObj.feesDue = val
        }
        return rowObj
      })

      setPreview({ headers, rows: normalizedRows, total: normalizedRows.length })
    }
    reader.readAsText(file)
  }

  const handleUpload = async () => {
    if (!preview || saving) return
    setSaving(true)
    setError('')
    setWarning('')
    try {
      const result = await onUpload(preview.rows)
      const successMsg = result?.message || `Successfully processed ${result?.count ?? preview.total} rows`
      setSuccess(successMsg)
      if (result?.skipped > 0) {
        setWarning(`${result.skipped} record(s) already existed or were skipped.`)
      }
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputId = `csv-${title.replace(/\s/g, '')}`

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
        <button
          onClick={downloadSample}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2">
          <i className="fas fa-download" /> Download Template
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Required CSV Columns</p>
        <div className="flex flex-wrap gap-2">
          {columns.map((c) => <Badge key={c} type="info">{c}</Badge>)}
        </div>
        {acceptText && <p className="text-xs text-slate-500 mt-2"><i className="fas fa-info-circle mr-1" />{acceptText}</p>}
      </div>

      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-atria/40 hover:bg-atria-pale/20 transition-colors">
        <input type="file" accept=".csv" ref={fileRef} onChange={handleFile} className="hidden" id={inputId} />
        <label htmlFor={inputId} className="cursor-pointer">
          <i className="fas fa-cloud-arrow-up text-3xl text-slate-300 mb-3 block" />
          <p className="text-sm font-semibold text-slate-600">Click to upload CSV file</p>
          <p className="text-xs text-slate-400 mt-1">.csv files only</p>
        </label>
      </div>

      {preview && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden fade-in">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700"><i className="fas fa-table mr-1" />Preview — {preview.total} rows</p>
            <div className="flex gap-2">
              <button
                onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                disabled={saving}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={saving}
                className="px-4 py-1.5 bg-atria text-white text-xs font-semibold rounded-lg hover:bg-atria-dark transition-colors shadow-sm shadow-atria/20 disabled:opacity-60">
                {saving
                  ? <><i className="fas fa-circle-notch fa-spin mr-1" />Saving…</>
                  : <><i className="fas fa-upload mr-1" />Upload {preview.total} Rows</>}
              </button>
            </div>
          </div>
          <div className="max-h-48 overflow-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-100">
                  {preview.headers.map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {preview.headers.map((h) => <td key={h} className="px-3 py-1.5 text-xs text-slate-600">{row[h]}</td>)}
                  </tr>
                ))}
                {preview.total > 10 && (
                  <tr>
                    <td colSpan={preview.headers.length} className="px-3 py-2 text-xs text-slate-400 text-center">
                      ... and {preview.total - 10} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-no-light border border-no/20 rounded-lg flex items-center gap-2 fade-in">
          <i className="fas fa-circle-exclamation text-no text-xs" />
          <p className="text-sm text-no font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-3 bg-ok-light border border-ok/20 rounded-lg flex items-center gap-2 fade-in">
          <i className="fas fa-circle-check text-ok text-xs" />
          <p className="text-sm text-ok font-medium">{success}</p>
        </div>
      )}
      {warning && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 fade-in">
          <i className="fas fa-triangle-exclamation text-amber-600 text-xs" />
          <p className="text-sm text-amber-800 font-medium">{warning}</p>
        </div>
      )}
    </div>
  )
}
