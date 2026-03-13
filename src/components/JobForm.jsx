// JobForm.jsx — Add / Edit modal form
//
// Used for both creating new jobs and editing existing ones.
// When a `job` prop is passed, the form pre-fills with that job's data (edit mode).
// When `job` is null/undefined, the form starts empty (add mode).

import { useState } from "react"
import { STATUS_CONFIG } from "../utils/statusConfig"

// Props:
//   job      — existing job object to edit, or null/undefined for a new entry
//   onSubmit — callback(formData) called when form is submitted successfully
//   onClose  — callback() called when the modal should be dismissed
export default function JobForm({ job, onSubmit, onClose }) {

  // Initialize form state.
  // If `job` is provided (edit mode), pre-fill each field with the existing value.
  // The ?. (optional chaining) and || "" safely handle the null case.
  // Date defaults to today in ISO format (e.g. "2026-03-14"), then strips the time part.
  const [form, setForm] = useState({
    company: job?.company || "",
    role:    job?.role    || "",
    salary:  job?.salary  || "",
    status:  job?.status  || "applied", // default status for new entries
    date:    job?.date    || new Date().toISOString().split("T")[0],
    notes:   job?.notes   || "",
  })

  // Reusable change handler factory.
  // Instead of writing a separate handler for each field, `set("company")` returns
  // a function that updates just the "company" key in the form state.
  // The spread (...p) preserves all other fields when updating one.
  //
  // Usage: onChange={set("company")}
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  // Form submission handler.
  // e.preventDefault() stops the browser from doing a full page reload (default form behaviour).
  // Basic validation: company and role are required.
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.company.trim() || !form.role.trim()) return // bail if required fields are empty
    onSubmit(form) // pass the complete form data up to App.jsx
  }

  return (
    // Overlay: full-screen dark backdrop with centered modal card
    // backdrop-blur-sm blurs the content behind the modal
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#16161f] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">

        {/* ── Modal header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          {/* Title changes based on whether we're adding or editing */}
          <h2 className="text-base font-semibold text-white">
            {job ? "Edit Application" : "New Application"}
          </h2>
          {/* X close button */}
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Form body ──────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Row 1: Company + Role (required fields, marked with *) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Company *</label>
              <input
                value={form.company}
                onChange={set("company")} // uses the handler factory above
                placeholder="e.g. Stripe"
                required
                className="w-full bg-white/5 border border-white/8 text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-violet-500/50 placeholder:text-white/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Role *</label>
              <input
                value={form.role}
                onChange={set("role")}
                placeholder="e.g. Frontend Engineer"
                required
                className="w-full bg-white/5 border border-white/8 text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-violet-500/50 placeholder:text-white/20 transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Salary + Date (both optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Salary Range</label>
              <input
                value={form.salary}
                onChange={set("salary")}
                placeholder="e.g. $120k - $150k"
                className="w-full bg-white/5 border border-white/8 text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-violet-500/50 placeholder:text-white/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Date Applied</label>
              {/* [color-scheme:dark] makes the native date picker use dark styling */}
              <input
                type="date"
                value={form.date}
                onChange={set("date")}
                className="w-full bg-white/5 border border-white/8 text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-violet-500/50 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Status picker — visual button grid instead of a boring dropdown */}
          {/* Object.entries converts STATUS_CONFIG into [key, value] pairs for iteration */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button" // prevent this from submitting the form
                  onClick={() => setForm((p) => ({ ...p, status: key }))}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                    form.status === key
                      ? cfg.color + " ring-1 ring-violet-500/30" // selected: use status color + ring
                      : "bg-white/3 border-white/8 text-white/40 hover:bg-white/6" // unselected
                  }`}
                >
                  {/* Colored dot matching the status */}
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes — free text, optional */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Notes</label>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any notes, contacts, next steps..."
              rows={3}
              className="w-full bg-white/5 border border-white/8 text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-violet-500/50 placeholder:text-white/20 transition-colors resize-none"
            />
          </div>

          {/* ── Action buttons ──────────────────────────────────────────── */}
          <div className="flex gap-3 pt-1">
            {/* Cancel — type="button" so it doesn't accidentally submit the form */}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            {/* Submit — label changes based on add vs edit mode */}
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              {job ? "Save Changes" : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
