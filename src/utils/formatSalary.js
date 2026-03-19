export function formatSalary(raw) {
  if (!raw) return ""

  // Format a single number string with $ and commas
  const fmt = (str) => {
    const num = parseFloat(str.replace(/[^0-9.]/g, ""))
    if (isNaN(num)) return str
    return "$" + Math.round(num).toLocaleString()
  }

  // Handle ranges like "60000 - 70000" or "60000-70000"
  const parts = raw.split(/\s*[-–—]\s*/)
  if (parts.length === 2) {
    return `${fmt(parts[0])} - ${fmt(parts[1])}`
  }

  return fmt(raw)
}