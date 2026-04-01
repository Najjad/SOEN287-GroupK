export function formatAverage(value) {
  return `${(Number(value) || 0).toFixed(1)}%`;
}

export function getAverageColor(value) {
  if (value >= 90) return "#16a34a";
  if (value >= 80) return "#2563eb";
  if (value >= 70) return "#d97706";
  return "#dc2626";
}

export function getProgressTone(value) {
  if (value >= 80) return "#16a34a";
  if (value >= 50) return "#2563eb";
  if (value >= 25) return "#d97706";
  return "#dc2626";
}

export function getDaysLabel(daysLeft) {
  if (daysLeft < 0) {
    return `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue`;
  }

  if (daysLeft === 0) {
    return "Due today";
  }

  return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
}
