// JobList.jsx — Applications table view with inline editing
//
// Every cell is click-to-edit. Clicking a text cell replaces it with an input.
// The status cell shows a dropdown. The date cell shows a date picker.
// Changes save on blur (clicking away) or pressing Enter. Escape cancels.

import { useState, useRef, useEffect } from "react"
import { STATUS_CONFIG } from "../utils/statusConfig"

// ── StatusBadge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.applied
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ── InlineText ────────────────────────────────────────────────────────────────
// A cell that shows plain text, but clicking it reveals an input field.
// Saves on blur or Enter. Cancels (reverts) on Escape.
//
// Props:
//   value      — current string value to display
//   onSave     — callback(newValue) called when the edit is committed
//   className  — extra classes for the display text
//   inputClass — extra classes for the input element
//   placeholder — shown when the field is empty
function InlineText({ value, onSave, className = "", inputClass = "", placeholder = "" }) {
  const [editing, setEditing]   = useState(false) // whether input is visible
  const [draft,   setDraft]     = useState(value)  // working copy while editing
  const inputRef                = useRef(null)

  // Auto-focus the input as soon as it appears in the DOM
  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const startEdit = () => {
    setDraft(value)   // reset draft to current saved value
    setEditing(true)
  }

  const commit = () => {
    setEditing(false)
    // Only save if the value actually changed
    if (draft !== value) onSave(draft)
  }

  const cancel = () => {
    setDraft(value)   // discard changes
    setEditing(false)
  }

  const handleKey = (e) => {
    if (e.key === "Enter")  commit()
    if (e.key === "Escape") cancel()
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className={`bg-white/8 border border-violet-500/50 text-white text-sm px-2 py-1 rounded focus:outline-none w-full ${inputClass}`}
      />
    )
  }

  return (
    // The group/hover classes on the parent <tr> reveal a subtle edit hint on hover
    <span
      onClick={startEdit}
      title="Click to edit"
      className={`cursor-pointer rounded px-1 -mx-1 hover:bg-white/8 transition-colors block ${className}`}
    >
      {value || <span className="text-white/20 italic">{placeholder || "—"}</span>}
    </span>
  )
}

// ── InlineDate ────────────────────────────────────────────────────────────────
// Same pattern as InlineText but renders a native date input when editing.
function InlineDate({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const inputRef              = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  const commit = (newVal) => {
    setEditing(false)
    if (newVal && newVal !== value) onSave(newVal)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="date"
        defaultValue={value}
        onChange={(e) => commit(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
        className="bg-white/8 border border-violet-500/50 text-white text-xs px-2 py-1 rounded focus:outline-none [color-scheme:dark]"
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      className="cursor-pointer rounded px-1 -mx-1 hover:bg-white/8 transition-colors block text-white/40 text-xs"
    >
      {formatDate(value)}
    </span>
  )
}

// ── InlineStatus ──────────────────────────────────────────────────────────────
// Clicking the status badge opens a small dropdown of all status options.
// Selecting one saves immediately and closes the dropdown.
function InlineStatus({ value, onSave }) {
  const [open,    setOpen]    = useState(false)
  const [openUp,  setOpenUp]  = useState(false)
  const ref                   = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const toggle = () => {
    if (!open && ref.current) {
      // Measure how much space is below the button vs above
      // and open in whichever direction has more room
      const rect = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUp(spaceBelow < 220) // 220px ≈ height of the dropdown
    }
    setOpen((o) => !o)
  }

  const select = (key) => {
    setOpen(false)
    if (key !== value) onSave(key)
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={toggle} title="Click to change status">
        <StatusBadge status={value} />
      </button>

      {open && (
        <div className={`absolute left-0 bg-[#1e1e2a] border border-white/10 rounded-xl shadow-2xl z-30 py-1.5 min-w-[160px] ${
          openUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
        }`}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => select(key)}
              className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors hover:bg-white/6 ${
                key === value ? "text-white" : "text-white/50"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
              {cfg.label}
              {key === value && (
                <svg className="ml-auto text-violet-400" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────
const FILTERS = ["all", "applied", "awaiting", "interviewing", "offered", "ghosted", "rejected", "interviewRejected"]
// ── JobList ───────────────────────────────────────────────────────────────────
// Props:
//   jobs     — array of job objects
//   onEdit   — callback(job) — still used by the pencil icon for full modal edit
//   onUpdate — callback(id, fieldData) — new: saves a single inline field change
//   onDelete — callback(id)
export default function JobList({ jobs, onEdit, onUpdate, onDelete }) {
  const [filter,        setFilter]        = useState("all")
  const [search,        setSearch]        = useState("")
  const [sortBy,        setSortBy]        = useState("date")
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Helper: save a single field for a job without touching the rest
  // e.g. saveField("abc123", "status", "offered")
  const saveField = (id, field, value) => onUpdate(id, { [field]: value })

  const filtered = jobs
    .filter((j) => filter === "all" || j.status === filter)
    .filter((j) =>
      search === "" ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
          if (sortBy === "date") {
            return new Date(b.date) - new Date(a.date)
          }
          if (sortBy === "company") {
            const aVal = a.company?.trim()
            const bVal = b.company?.trim()
            if (!aVal && !bVal) return 0
            if (!aVal) return 1   // a is empty → push to bottom
            if (!bVal) return -1  // b is empty → push to bottom
            return aVal.localeCompare(bVal)
          }
          if (sortBy === "salary") {
            const aVal = a.salary?.trim()
            const bVal = b.salary?.trim()
            if (!aVal && !bVal) return 0
            if (!aVal) return 1
            if (!bVal) return -1
            return aVal.localeCompare(bVal)
          }
          return 0
        })

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Applications</h1>
        <p className="text-white/40 text-sm mt-1">
          {jobs.length} total · {filtered.length} shown
          <span className="ml-3 text-white/20">· click any cell to edit</span>
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search company or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/8 text-white text-sm pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-violet-500/50 placeholder:text-white/25 transition-colors"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#1a1a24] border border-white/8 text-white/70 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-violet-500/50 transition-colors"
          >
            <option value="date">Sort: Date</option>
            <option value="company">Sort: Company</option>
            <option value="salary">Sort: Salary</option>
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                filter === f
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10"
              }`}
            >
              {f === "all"
                ? `All (${jobs.length})`
                : `${STATUS_CONFIG[f]?.label} (${jobs.filter(j => j.status === f).length})`
              }
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-white/25">
          <svg className="mx-auto mb-3 opacity-30" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="6" y="10" width="28" height="22" rx="3" stroke="white" strokeWidth="1.5"/>
            <path d="M13 18h14M13 23h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-sm">No applications found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                <th className="text-left px-5 py-3.5 text-white/35 font-medium text-xs uppercase tracking-wider">Company</th>
                <th className="text-left px-5 py-3.5 text-white/35 font-medium text-xs uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3.5 text-white/35 font-medium text-xs uppercase tracking-wider">Salary</th>
                <th className="text-left px-5 py-3.5 text-white/35 font-medium text-xs uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3.5 text-white/35 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-white/35 font-medium text-xs uppercase tracking-wider">Notes</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job, i) => (
                <tr
                  key={job.id}
                  className={`border-b border-white/5 hover:bg-white/2 transition-colors group ${
                    i === filtered.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {/* Company */}
                  <td className="px-5 py-3.5">
                    <InlineText
                      value={job.company}
                      onSave={(v) => saveField(job.id, "company", v)}
                      className="font-semibold text-white"
                      placeholder="Company name"
                    />
                  </td>

                  {/* Role */}
                  <td className="px-5 py-3.5">
                    <InlineText
                      value={job.role}
                      onSave={(v) => saveField(job.id, "role", v)}
                      className="text-white/70"
                      placeholder="Job title"
                    />
                  </td>

                  {/* Salary */}
                  <td className="px-5 py-3.5">
                    <InlineText
                      value={job.salary}
                      onSave={(v) => saveField(job.id, "salary", v)}
                      className="text-white/50 font-mono text-xs"
                      placeholder=""
                    />
                  </td>

                  {/* Date — native date picker */}
                  <td className="px-5 py-3.5">
                    <InlineDate
                      value={job.date}
                      onSave={(v) => saveField(job.id, "date", v)}
                    />
                  </td>

                  {/* Status — click badge to open dropdown */}
                  <td className="px-5 py-3.5">
                    <InlineStatus
                      value={job.status}
                      onSave={(v) => saveField(job.id, "status", v)}
                    />
                  </td>

                  {/* Actions: full-modal edit + delete */}
                  <td className="px-5 py-3.5 max-w-[220px]">
                    <InlineText
                      value={job.notes}
                      onSave={(v) => saveField(job.id, "notes", v)}
                      className="text-xs text-white/40"
                      placeholder="Add notes..."
                    />
                  </td>

                  {/* Actions: full-modal edit + delete */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Pencil — opens full modal (useful for editing notes with more space) */}
                      <button
                        onClick={() => onEdit(job)}
                        title="Open full edit form"
                        className="text-white/25 hover:text-white/70 transition-colors p-1.5 rounded hover:bg-white/5"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {/* Trash — triggers confirmation modal */}
                      <button
                        onClick={() => setConfirmDelete(job.id)}
                        title="Delete application"
                        className="text-white/25 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-500/10"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2 3.5h10M5 3.5V2h4v1.5M5.5 6v4M8.5 6v4M3 3.5l.7 8h6.6l.7-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a24] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="font-semibold text-white mb-2">Delete application?</h3>
            <p className="text-white/50 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(confirmDelete); setConfirmDelete(null) }}
                className="flex-1 py-2.5 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors border border-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}