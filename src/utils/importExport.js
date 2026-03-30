import * as XLSX from "xlsx"

// ── Export ────────────────────────────────────────────────────────────────────

export function exportToCSV(jobs) {
  const headers = ["Company", "Role", "Salary", "Date", "Status", "Notes"]
  const rows = jobs.map((j) => [j.company, j.role, j.salary, j.date, j.status, j.notes])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n")

  download(new Blob([csv], { type: "text/csv" }), "applications.csv")
}

export function exportToExcel(jobs) {
  const rows = jobs.map((j) => ({
    Company: j.company,
    Role:    j.role,
    Salary:  j.salary,
    Date:    j.date,
    Status:  j.status,
    Notes:   j.notes,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Applications")
  XLSX.writeFile(wb, "applications.xlsx")
}

// ── Import ────────────────────────────────────────────────────────────────────

export function importFromCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const lines = e.target.result.split("\n").filter(Boolean)
        const [headerLine, ...dataLines] = lines
        const headers = parseCSVRow(headerLine).map((h) => h.toLowerCase())
        const jobs = dataLines.map((line) => {
          const values = parseCSVRow(line)
          const obj = {}
          headers.forEach((h, i) => { obj[h] = values[i] ?? "" })
          return normalise(obj)
        })
        resolve(jobs)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function importFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: "array" })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" })
        resolve(rows.map((r) => normalise(r)))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseCSVRow(row) {
  const result = []
  let current  = ""
  let inQuotes = false
  for (let i = 0; i < row.length; i++) {
    const ch = row[i]
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim()); current = ""
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

const VALID_STATUSES = ["applied", "awaiting", "interviewing", "offered", "ghosted", "rejected", "interviewRejected"]

function normalise(row) {
  const get = (key) => {
    const match = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase())
    return match ? String(row[match]).trim() : ""
  }

  const status = get("status").toLowerCase()

  return {
    id:      Date.now().toString() + Math.random().toString(36).slice(2),
    company: get("company"),
    role:    get("role"),
    salary:  get("salary"),
    date:    get("date") || new Date().toISOString().split("T")[0],
    status:  VALID_STATUSES.includes(status) ? status : "applied",
    notes:   get("notes"),
  }
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement("a")
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}