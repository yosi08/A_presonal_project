export function getMonthInfo(year: number, month: number) {
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  return {
    startingDay: firstDayOfMonth.getDay(),
    totalDays: lastDayOfMonth.getDate(),
  }
}

export function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function isToday(day: number, month: number, year: number): boolean {
  const today = new Date()
  return (
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
  )
}

export function isSelected(
  day: number,
  month: number,
  year: number,
  selectedDate: Date
): boolean {
  return (
    day === selectedDate.getDate() &&
    month === selectedDate.getMonth() &&
    year === selectedDate.getFullYear()
  )
}
