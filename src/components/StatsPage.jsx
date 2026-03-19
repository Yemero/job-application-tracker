// StatsPage.jsx — Stats dashboard
//
// Displays three visualisations:
//   1. Summary stat cards (total, response rate, active pipeline)
//   2. Donut chart — jobs broken down by status
//   3. Funnel — shows conversion from applied → offered
//   4. Weekly bar chart — applications per week over the last 8 weeks

import { useMemo } from "react"
import { STATUS_CONFIG, CHART_COLORS } from "../utils/statusConfig"

const QUOTES = [
  { text: "Every application is a step forward, even the ones that don't pan out.", author: "Unknown" },
  { text: "The right opportunity is out there. Keep showing up.", author: "Unknown" },
  { text: "Rejection is redirection.", author: "Unknown" },
  { text: "You only need one yes.", author: "Unknown" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Every no gets you closer to the right yes.", author: "Unknown" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "A setback is a setup for a comeback.", author: "T.D. Jakes" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Persistence is the difference between those who make it and those who don't.", author: "Unknown" },
]

const QUOTE = QUOTES[Math.floor(Math.random() * QUOTES.length)]


// ── DonutChart ────────────────────────────────────────────────────────────────
// Renders a pure SVG donut chart using the strokeDasharray technique.
//
// How it works:
//   - Each segment is a <circle> with a stroke (no fill).
//   - strokeWidth creates the ring thickness (r - innerR).
//   - strokeDasharray controls how much of the circumference is colored vs transparent.
//   - strokeDashoffset rotates where the segment starts around the ring.
//   - The SVG is rotated -90deg so segments start at the top (12 o'clock).
//
// Props:
//   data  — array of { key, count, color } objects
//   total — total number of jobs (used to calculate percentages)
function DonutChart({ data, total }) {
  const size = 250          // SVG canvas dimensions (square)
  const cx = size / 2       // center x
  const cy = size / 2       // center y
  const r = 101              // outer radius of the ring
  const innerR = 86         // inner radius (hole) — strokeWidth = r - innerR = 24px
  const circumference = 2 * Math.PI * r // total arc length of the circle
  const gap = 3             // small gap (in px) between segments for visual separation

  // Pre-calculate each segment's dash values.
  // useMemo caches this until data or total changes, avoiding recalculation every render.
  const segments = useMemo(() => {
    let offset = 0 // tracks how far around the circle we've drawn so far
    return data.map((item) => {
      const pct  = total > 0 ? item.count / total : 0 // fraction of the total
      const dash = pct * circumference - gap           // length of the colored stroke
      const seg  = { ...item, dash, offset, pct }
      offset += pct * circumference                    // advance offset for next segment
      return seg
    })
  }, [data, total, circumference])

  return (
    // rotate(-90deg) moves the start point from 3 o'clock to 12 o'clock
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}style={{ transform: "rotate(-90deg)" }}>
      {total === 0 ? (
        // Empty state: single gray ring when there's no data
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={r - innerR} />
      ) : (
        // Render one circle per status (skipping statuses with 0 jobs)
        segments.map((seg) =>
          seg.count > 0 ? (
            <circle
              key={seg.key}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={r - innerR}   // ring thickness
              // dash = colored length, rest = transparent gap
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              // negative offset = rotate clockwise to the correct start position
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"       // flat ends (no rounded caps bleeding into neighbors)
              style={{ transition: "stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease" }}
            />
          ) : null
        )
      )}
    </svg>
  )
}

// ── StatsPage ─────────────────────────────────────────────────────────────────
// Props:
//   jobs — full array of job objects (read-only, no mutations here)
export default function StatsPage({ jobs }) {

  // Build per-status counts and merge with display config.
  // useMemo prevents recalculating this on every render.
  const statusData = useMemo(() => {
    // Count how many jobs have each status
    const counts = {}
    jobs.forEach((j) => { counts[j.status] = (counts[j.status] || 0) + 1 })

    // Map STATUS_CONFIG entries into objects the chart and legend can consume
    return Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
      key,
      label:      cfg.label,
      count:      counts[key] || 0,   // default 0 if no jobs have this status
      color:      CHART_COLORS[key],  // hex color for SVG rendering
      badgeClass: cfg.color,
      dot:        cfg.dot,
    }))
  }, [jobs])

  // ── Summary metrics ──────────────────────────────────────────────────────
  const total = jobs.length

  // Response rate: jobs where the company replied in any form
  // (interviewing, offered, or rejected all mean we got a response)
  const responseRate = total > 0
    ? Math.round((jobs.filter(j => ["interviewing", "offered", "rejected"].includes(j.status)).length / total) * 100)
    : 0

  // Offer rate: jobs that resulted in an offer
  const offerRate = total > 0
    ? Math.round((jobs.filter(j => j.status === "offered").length / total) * 100)
    : 0

  // Active pipeline: still in play (not ghosted, rejected, or offered/closed)
  const activeCount = jobs.filter(j => ["applied", "awaiting", "interviewing"].includes(j.status)).length

  // ── Timeline: applications per week over last 8 weeks ───────────────────
  const timelineData = useMemo(() => {
    const weeks = []
    for (let i = 7; i >= 0; i--) {
      // Work backwards from today, 7 days at a time
      const d = new Date()
      d.setDate(d.getDate() - i * 7)

      // Find the Sunday that starts this week
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())

      weeks.push({
        label: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        // Count jobs whose date falls within this 7-day window
        count: jobs.filter((j) => {
          const jd   = new Date(j.date)
          const diff = (jd - weekStart) / (1000 * 60 * 60 * 24) // difference in days
          return diff >= 0 && diff < 7
        }).length,
      })
    }
    return weeks
  }, [jobs])

  // The tallest bar should fill 72px; other bars scale relative to it.
  // Math.max(..., 1) prevents division by zero when all weeks have 0 applications.
  const maxCount = Math.max(...timelineData.map((w) => w.count), 1)

  return (
    <div className="p-8">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Stats</h1>
        <div className="mt-1">
          <p className="text-white/40 text-sm italic">"{QUOTE.text}"</p>
          <p className="text-white/25 text-xs mt-0.5">— {QUOTE.author}</p>
        </div>
      </div>

      {/* ── Summary stat cards ────────────────────────────────────────────── */}
      {/* Three cards in a row; data is defined inline as an array for brevity */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Applications", value: total,           sub: "all time" },
          { label: "Response Rate",      value: `${responseRate}%`, sub: "replied or interviewed" },
          { label: "Active Pipeline",    value: activeCount,     sub: "in progress" },
        ].map((card) => (
          <div key={card.label} className="bg-white/3 border border-white/8 rounded-xl px-5 py-4">
            <div className="text-3xl font-semibold text-white mb-1">{card.value}</div>
            <div className="text-sm text-white/60">{card.label}</div>
            <div className="text-xs text-white/25 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Two-column row: Donut chart + Funnel ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-6 mb-6">

        {/* Donut chart panel */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-6">
          <h3 className="text-sm font-medium text-white/70 mb-5">By Status</h3>
          <div className="flex items-center gap-6 justify-center">
            {/* Chart + center label overlay */}
            <div className="relative flex-shrink-0">
              <DonutChart data={statusData} total={total} />
              {/* Centered label sits on top of the SVG using absolute positioning */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-semibold text-white">{total}</span>
                <span className="text-xs text-white/35">total</span>
              </div>
            </div>

            {/* Legend — one row per status that has at least one job */}
            <div className="flex flex-col gap-2.5 min-w-0">
              {statusData.filter(s => s.count > 0).map((s) => (
                <div key={s.key} className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-white/55 flex-1 truncate">{s.label}</span>
                  <span className="text-xs font-medium text-white ml-auto">{s.count}</span>
                  <span className="text-xs text-white/25 w-8 text-right">
                    {total > 0 ? Math.round((s.count / total) * 100) : 0}%
                  </span>
                </div>
              ))}
              {/* Fallback when no jobs exist yet */}
              {statusData.every(s => s.count === 0) && (
                <p className="text-xs text-white/25">No applications yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Conversion funnel panel */}
        {/* Each step shows count as a proportion of total applications */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-6">
          <h3 className="text-sm font-medium text-white/70 mb-5">Funnel</h3>
          <div className="space-y-3">
            {[
              // Each step: label, how many jobs qualify, bar color
              { label: "Applied",       count: total, color: "#3b82f6" },
              // "Got Response" = any reply, even a rejection
              { label: "Got Response",  count: jobs.filter(j => ["interviewing", "offered", "rejected"].includes(j.status)).length, color: "#8b5cf6" },
              // "Interviewing" includes those that went on to get an offer
              { label: "Interviewing",  count: jobs.filter(j => ["interviewing", "offered"].includes(j.status)).length, color: "#f59e0b" },
              { label: "Offered",       count: jobs.filter(j => j.status === "offered").length, color: "#10b981" },
            ].map((step) => (
              <div key={step.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/50">{step.label}</span>
                  <span className="text-white font-medium">{step.count}</span>
                </div>
                {/* Progress bar: width is percentage of total, transitions smoothly */}
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: total > 0 ? `${(step.count / total) * 100}%` : "0%",
                      background: step.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {/* Offer rate summary at the bottom */}
          <div className="mt-5 pt-4 border-t border-white/8 flex justify-between text-xs">
            <span className="text-white/35">Offer rate</span>
            <span className="text-emerald-400 font-semibold">{offerRate}%</span>
          </div>
        </div>
      </div>

      {/* ── Weekly bar chart ──────────────────────────────────────────────── */}
      <div className="bg-white/3 border border-white/8 rounded-xl p-6">
        <h3 className="text-sm font-medium text-white/70 mb-5">Applications per week</h3>
        {/* flex items-end: bars grow upward from the bottom baseline */}
        <div className="flex items-end gap-2 h-28">
          {timelineData.map((week, i) => (
            // group class enables the hover-reveal count label above each bar
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
              {/* Count label — invisible by default, revealed on hover via group-hover */}
              <span className="text-xs text-white/0 group-hover:text-white/60 transition-colors mb-1">
                {week.count > 0 ? week.count : ""}
              </span>
              <div className="w-full flex items-end justify-center">
                {/* Bar height is proportional to maxCount, capped at 72px */}
                <div
                  className="w-full rounded-t-sm transition-all duration-500"
                  style={{
                    height:    `${(week.count / maxCount) * 72}px`,
                    minHeight: week.count > 0 ? "4px" : "0px",   // keep a sliver visible for non-zero weeks
                    background: week.count > 0
                      ? "rgba(139,92,246,0.7)"  // violet for weeks with applications
                      : "rgba(255,255,255,0.04)", // near-invisible for empty weeks
                  }}
                />
              </div>
              {/* Week start date label below each bar */}
              <span className="text-[10px] text-white/20 text-center leading-tight">{week.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
