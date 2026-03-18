// statusConfig.js — Single source of truth for status metadata
//
// By centralising status labels and colors here, we avoid repeating them
// in every component. Adding a new status only requires changes in this file.

// STATUS_CONFIG maps each status key to its display label and Tailwind color classes.
// Used by: JobList (badge), JobForm (status picker buttons), StatsPage (legend)
//
// color — Tailwind classes for the badge background, text, and border
// dot   — Tailwind class for the small colored circle inside the badge
export const STATUS_CONFIG = {
  applied: {
    label: "Applied",
    color: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    dot: "bg-blue-400",
  },
  awaiting: {
    label: "Awaiting Reply",
    color: "bg-amber-500/15 text-amber-300 border-amber-500/20",
    dot: "bg-amber-400",
  },
  interviewing: {
    label: "Interviewing",
    color: "bg-violet-500/15 text-violet-300 border-violet-500/20",
    dot: "bg-violet-400",
  },
  interviewRejected: {
    label: "Interview Rejected",
    color: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    dot: "bg-orange-400",
  },
  offered: {
    label: "Offered",
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  ghosted: {
    label: "Ghosted",
    color: "bg-slate-500/15 text-slate-400 border-slate-500/20",
    dot: "bg-slate-500",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-500/15 text-red-400 border-red-500/20",
    dot: "bg-red-500",
  },
}

// CHART_COLORS maps status keys to hex color values for SVG/canvas rendering.
// Tailwind classes don't work in SVG attributes, so we need raw hex here.
// Used by: StatsPage (donut chart segments, funnel bars, legend dots)
export const CHART_COLORS = {
  applied: "#3b82f6",      // blue-500
  awaiting: "#f59e0b",     // amber-500
  interviewing: "#8b5cf6", // violet-500
  interviewRejected: "#f97316",  // orange-500  offered: "#10b981",      // emerald-500
  ghosted: "#64748b",      // slate-500
  rejected: "#ef4444",     // red-500
}
