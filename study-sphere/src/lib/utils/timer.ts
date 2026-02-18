export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function calculateProgress(timeLeft: number, totalMinutes: number): number {
  const totalSeconds = totalMinutes * 60
  if (totalSeconds === 0) return 0
  return ((totalSeconds - timeLeft) / totalSeconds) * 100
}

export function calculateStrokeDashoffset(progress: number, radius: number): number {
  const circumference = 2 * Math.PI * radius
  return circumference - (progress / 100) * circumference
}
