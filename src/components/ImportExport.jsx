// ImportExport.jsx — dedicated page for importing and exporting job data

import { useRef, useState } from "react"
import { exportToCSV, exportToExcel, importFromCSV, importFromExcel } from "../utils/importExport"

export default function ImportExport({ jobs, onAdd }) {
  const fileInputRef            = useRef(null)
  const [importing, setImporting] = useState(false)
  const [result,    setResult]    = useState(null) // { count, error }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    setResult(null)
    try {
      const imported = file.name.endsWith(".csv")
        ? await importFromCSV(file)
        : await importFromExcel(file)
      imported.forEach((job) => onAdd(job))
      setResult({ count: imported.length, error: false })
    } catch {
      setResult({ count: 0, error: true })
    }
    setImporting(false)
    e.target.value = ""
  }

  return (
    <div className="p-8 max-w-2xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Import / Export</h1>
        <p className="text-white/40 text-sm mt-1">Back up your data or bring in applications from a spreadsheet</p>
      </div>

      {/* Export */}
      <div className="bg-white/3 border border-white/8 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-medium text-white mb-1">Export</h2>
        <p className="text-white/40 text-xs mb-5">
          Download all {jobs.length} applications as a file you can open in Excel or Google Sheets.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => exportToCSV(jobs)}
            disabled={jobs.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/8 border border-white/8 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 10V2M4 7l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 11v1.5h12V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Export as CSV
          </button>
          <button
            onClick={() => exportToExcel(jobs)}
            disabled={jobs.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/8 border border-white/8 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 10V2M4 7l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 11v1.5h12V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Export as Excel
          </button>
        </div>
      </div>

      {/* Import */}
      <div className="bg-white/3 border border-white/8 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-medium text-white mb-1">Import</h2>
        <p className="text-white/40 text-xs mb-5">
          Import applications from a CSV or Excel file. Imported entries are added to your existing list.
        </p>

        {/* Drop zone */}
        <button
          onClick={() => fileInputRef.current.click()}
          className="w-full border border-dashed border-white/15 hover:border-violet-500/50 rounded-xl py-10 flex flex-col items-center gap-3 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-violet-500/10 flex items-center justify-center transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 12V4M5 7l4-4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 13v2a1 1 0 001 1h14a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
              {importing ? "Importing..." : "Click to choose a file"}
            </p>
            <p className="text-xs text-white/25 mt-0.5">.csv or .xlsx</p>
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx" onChange={handleImport} className="hidden" />

        {/* Result message */}
        {result && (
          <div className={`mt-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
            result.error
              ? "bg-red-500/10 border border-red-500/20 text-red-400"
              : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          }`}>
            {result.error ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Failed to import. Make sure the file has columns: Company, Role, Salary, Date, Status, Notes.
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Successfully imported {result.count} application{result.count !== 1 ? "s" : ""}.
              </>
            )}
          </div>
        )}
      </div>

      {/* Format reference */}
      <div className="bg-white/3 border border-white/8 rounded-xl p-6">
        <h2 className="text-sm font-medium text-white mb-1">Expected format</h2>
        <p className="text-white/40 text-xs mb-4">
          Your file should have these column headers in the first row. Column order doesn't matter.
        </p>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left py-2 pr-4 text-white/35 font-medium">Column</th>
              <th className="text-left py-2 text-white/35 font-medium">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              ["Company",  "Stripe"],
              ["Role",     "Frontend Engineer"],
              ["Salary",   "120000 - 150000"],
              ["Date",     "2026-03-14"],
              ["Status",   "applied / awaiting / interviewing / offered / ghosted / rejected"],
              ["Notes",    "Referral from Jane"],
            ].map(([col, ex]) => (
              <tr key={col}>
                <td className="py-2 pr-4 text-white/60 font-mono">{col}</td>
                <td className="py-2 text-white/30">{ex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}