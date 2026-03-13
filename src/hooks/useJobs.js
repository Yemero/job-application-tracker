// useJobs.js — Custom hook for all job data management
//
// A "custom hook" is just a regular function whose name starts with "use".
// It can call React's built-in hooks (useState, useEffect) internally.
// This keeps data logic out of the UI components so they stay clean.

import { useState, useEffect } from "react"

// The key used to store/retrieve data from localStorage.
// Using a constant avoids typos across multiple places.
const STORAGE_KEY = "jobtrack_applications"

// Sample data shown on first load so the app doesn't look empty.
// Covers all 6 status types so the stats page has something to display.
const SAMPLE_JOBS = [
  {
    id: "1",
    company: "Stripe",
    role: "Frontend Engineer",
    salary: "$140,000 - $170,000",
    status: "interviewing",
    date: "2026-03-01",
    notes: "Two rounds done, final loop next week",
  },
  {
    id: "2",
    company: "Linear",
    role: "Product Designer",
    salary: "$120,000 - $145,000",
    status: "awaiting",
    date: "2026-03-05",
    notes: "Applied via referral",
  },
  {
    id: "3",
    company: "Vercel",
    role: "Software Engineer",
    salary: "$130,000 - $160,000",
    status: "applied",
    date: "2026-03-08",
    notes: "",
  },
  {
    id: "4",
    company: "Notion",
    role: "Full Stack Developer",
    salary: "$125,000 - $155,000",
    status: "ghosted",
    date: "2026-02-14",
    notes: "No response after 3 weeks",
  },
  {
    id: "5",
    company: "Figma",
    role: "React Engineer",
    salary: "$150,000 - $180,000",
    status: "rejected",
    date: "2026-02-20",
    notes: "Rejected after technical screen",
  },
  {
    id: "6",
    company: "Loom",
    role: "Senior Frontend",
    salary: "$135,000 - $160,000",
    status: "offered",
    date: "2026-02-28",
    notes: "Offer received! Negotiating.",
  },
]

export function useJobs() {
  // Initialize jobs state by reading from localStorage.
  // The function passed to useState runs once on first render (lazy initializer).
  // We wrap it in try/catch in case localStorage is unavailable or has corrupted data.
  const [jobs, setJobs] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        // Parse the JSON string back into a JavaScript array
        return JSON.parse(stored)
      }
      // No data yet — seed with sample jobs and save them
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_JOBS))
      return SAMPLE_JOBS
    } catch {
      // Fallback if localStorage throws (e.g. private browsing restrictions)
      return SAMPLE_JOBS
    }
  })

  // Sync jobs to localStorage whenever the jobs array changes.
  // useEffect runs after every render where [jobs] has changed.
  // This means every add/update/delete is automatically persisted.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  }, [jobs]) // ← dependency array: only re-run when `jobs` changes

  // Add a new job to the top of the list.
  // Date.now() gives a unique numeric timestamp — used as a simple unique ID.
  // The spread (...data) copies all form fields into the new object.
  const addJob = (data) => {
    const newJob = { ...data, id: Date.now().toString() }
    setJobs((prev) => [newJob, ...prev]) // prepend so newest jobs appear first
  }

  // Update an existing job by ID.
  // .map() returns a new array — React requires immutable updates (no direct mutation).
  // For the matching job, spread the existing data then overwrite with new data.
  const updateJob = (id, data) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...data } : j)))
  }

  // Remove a job by ID.
  // .filter() returns a new array excluding the job with the matching ID.
  const deleteJob = (id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  // Return the data and functions that components need
  return { jobs, addJob, updateJob, deleteJob }
}
