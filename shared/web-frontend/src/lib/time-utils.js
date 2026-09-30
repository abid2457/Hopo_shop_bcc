/**
 * HOPO SHOP LUXURY ATELIER — Time Formatting Utilities
 * Provides human-readable, dynamic relative time formatting.
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return "";
  let date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === "number") {
    date = new Date(dateInput);
  } else {
    // Handle SQL format "YYYY-MM-DD HH:MM:SS" or ISO format
    const cleaned = dateInput.replace(" ", "T");
    date = new Date(cleaned);
    // If invalid Date, fallback to standard parsing
    if (isNaN(date.getTime())) {
      date = new Date(dateInput);
    }
  }
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 45) {
    return "Just now";
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  // Format as day and month, e.g. "15 Sep" or "15 Sep 2025"
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  if (year === now.getFullYear()) {
    return `${day} ${month}`;
  }
  return `${day} ${month} ${year}`;
}
