import { getMonthInfo, formatDateString, isSelected } from '../calendar'

describe('getMonthInfo', () => {
  it('returns correct info for February 2024 (leap year)', () => {
    const info = getMonthInfo(2024, 1) // month is 0-indexed
    expect(info.totalDays).toBe(29)
  })

  it('returns correct info for February 2025 (non-leap year)', () => {
    const info = getMonthInfo(2025, 1)
    expect(info.totalDays).toBe(28)
  })

  it('returns correct info for January 2026', () => {
    const info = getMonthInfo(2026, 0)
    expect(info.totalDays).toBe(31)
    expect(info.startingDay).toBe(4) // Thursday
  })

  it('returns correct info for April (30 days)', () => {
    const info = getMonthInfo(2026, 3)
    expect(info.totalDays).toBe(30)
  })
})

describe('formatDateString', () => {
  it('pads single-digit month and day', () => {
    expect(formatDateString(2026, 0, 5)).toBe('2026-01-05')
  })

  it('handles double-digit month and day', () => {
    expect(formatDateString(2026, 11, 25)).toBe('2026-12-25')
  })

  it('handles month index 9 (October)', () => {
    expect(formatDateString(2026, 9, 15)).toBe('2026-10-15')
  })

  it('formats first day of year', () => {
    expect(formatDateString(2026, 0, 1)).toBe('2026-01-01')
  })
})

describe('isSelected', () => {
  it('returns true when date matches selectedDate', () => {
    const selected = new Date(2026, 1, 18)
    expect(isSelected(18, 1, 2026, selected)).toBe(true)
  })

  it('returns false when day differs', () => {
    const selected = new Date(2026, 1, 18)
    expect(isSelected(19, 1, 2026, selected)).toBe(false)
  })

  it('returns false when month differs', () => {
    const selected = new Date(2026, 1, 18)
    expect(isSelected(18, 2, 2026, selected)).toBe(false)
  })

  it('returns false when year differs', () => {
    const selected = new Date(2026, 1, 18)
    expect(isSelected(18, 1, 2025, selected)).toBe(false)
  })
})
