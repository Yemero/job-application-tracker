// App.jsx — Root component
// This is the top of the component tree. It owns all shared state and
// renders the sidebar, the active page, and the modal form.

import { useState } from "react"
import JobList from "./components/JobList"
import StatsPage from "./components/StatsPage"
import JobForm from "./components/JobForm"
import { useJobs } from "./hooks/useJobs"

export default function App() {
  // --- State ---

  // Controls which page is shown in the main content area
  const [view, setView] = useState("applications") // "applications" | "stats"

  // Controls whether the add/edit modal is open
  const [showForm, setShowForm] = useState(false)

  // Holds the job being edited. null means we're adding a new one.
  // When passed to <JobForm>, it pre-fills the form fields.
  const [editingJob, setEditingJob] = useState(null)

  // All job data and CRUD operations come from this custom hook.
  // The hook handles reading/writing to localStorage automatically.
  const { jobs, addJob, updateJob, deleteJob } = useJobs()

  // --- Handlers ---

  // Called when the user clicks the edit (pencil) button on a row.
  // Stores the job in state so JobForm can pre-fill from it, then opens the modal.
  const handleEdit = (job) => {
    setEditingJob(job)
    setShowForm(true)
  }

  // Called when the modal is closed (Cancel button or X icon).
  // Clears editingJob so the next open starts fresh.
  const handleFormClose = () => {
    setShowForm(false)
    setEditingJob(null)
  }

  // Called when the form is submitted.
  // If editingJob is set, we're updating an existing record.
  // Otherwise we're creating a new one.
  const handleFormSubmit = (data) => {
    if (editingJob) {
      updateJob(editingJob.id, data) // merge new data into the existing job
    } else {
      addJob(data) // create a brand new job entry
    }
    handleFormClose() // close the modal after saving
  }

  return (
    <div className="min-h-screen bg-[#0e0e11] text-white font-['DM_Sans',sans-serif]">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      {/* Fixed to the left edge, full height. Contains logo, nav, add button. */}
      <aside className="fixed top-0 left-0 h-full w-56 bg-[#13131a] border-r border-white/5 flex flex-col z-10">

        {/* Logo / branding */}
        <div className="px-6 py-7">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-violet-500 flex items-center justify-center">
              {/* Briefcase icon */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="4" width="12" height="9" rx="1.5" stroke="white" strokeWidth="1.2"/>
                <path d="M4 4V3a3 3 0 016 0v1" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">JobTrack</span>
          </div>
          <p className="text-[11px] text-white/30 ml-8">application tracker</p>
        </div>

        {/* Navigation buttons */}
        {/* The active button gets a violet highlight; inactive ones are dimmed */}
        <nav className="flex-1 px-3 space-y-1">

          {/* Applications nav item — switches to job list view */}
          <button
            onClick={() => setView("applications")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 ${
              view === "applications"
                ? "bg-violet-500/15 text-violet-300"           // active style
                : "text-white/40 hover:text-white/70 hover:bg-white/5" // inactive style
            }`}
          >
            {/* List icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="3" rx="1" fill="currentColor" opacity="0.7"/>
              <rect x="2" y="7" width="12" height="3" rx="1" fill="currentColor" opacity="0.5"/>
              <rect x="2" y="12" width="7" height="2" rx="1" fill="currentColor" opacity="0.3"/>
            </svg>
            Applications
            {/* Live count badge — updates whenever jobs array changes */}
            <span className="ml-auto text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{jobs.length}</span>
          </button>

          {/* Stats nav item — switches to stats/charts view */}
          <button
            onClick={() => setView("stats")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 ${
              view === "stats"
                ? "bg-violet-500/15 text-violet-300"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            {/* Bar chart icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="9" width="3" height="5" rx="1" fill="currentColor" opacity="0.5"/>
              <rect x="6.5" y="5" width="3" height="9" rx="1" fill="currentColor" opacity="0.7"/>
              <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" opacity="0.9"/>
            </svg>
            Stats
          </button>
        </nav>

        {/* Add Application button — pinned to the bottom of the sidebar */}
        <div className="px-3 pb-6">
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {/* Plus icon */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Add Application
          </button>
        </div>
      </aside>

      {/* ── Main content area ────────────────────────────────────────────── */}
      {/* Offset by the sidebar width (ml-56 = 224px) */}
      <main className="ml-56 min-h-screen">
        {/* Conditionally render the active page. Only one renders at a time — React unmounts the other. */}
        {/* Pass jobs data down, and the edit/delete/update handlers as callbacks.
            onUpdate is new — it saves a single field change from inline editing. */}
        {view === "applications" ? (
          <JobList jobs={jobs} onEdit={handleEdit} onDelete={deleteJob} onUpdate={updateJob} />
        ) : (
          // Stats only needs read access to jobs — no mutations needed
          <StatsPage jobs={jobs} />
        )}
      </main>

      {/* ── Add / Edit modal ─────────────────────────────────────────────── */}
      {/* Only rendered when showForm is true — React removes it from the DOM when closed */}
      {showForm && (
        <JobForm
          job={editingJob}        // null = new job mode, object = edit mode
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
