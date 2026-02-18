import { formatTime, calculateProgress, calculateStrokeDashoffset } from '../timer'

describe('formatTime', () => {
  it('formats 0 seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats 65 seconds as 01:05', () => {
    expect(formatTime(65)).toBe('01:05')
  })

  it('formats 3000 seconds as 50:00', () => {
    expect(formatTime(3000)).toBe('50:00')
  })

  it('formats 59 seconds as 00:59', () => {
    expect(formatTime(59)).toBe('00:59')
  })

  it('formats 3599 seconds as 59:59', () => {
    expect(formatTime(3599)).toBe('59:59')
  })
})

describe('calculateProgress', () => {
  it('returns 0 when timer just started (full time remaining)', () => {
    expect(calculateProgress(3000, 50)).toBe(0)
  })

  it('returns 50 at halfway', () => {
    expect(calculateProgress(1500, 50)).toBe(50)
  })

  it('returns 100 when timer is done', () => {
    expect(calculateProgress(0, 50)).toBe(100)
  })

  it('returns 0 when totalMinutes is 0 (edge case)', () => {
    expect(calculateProgress(0, 0)).toBe(0)
  })

  it('returns 75 at quarter remaining', () => {
    expect(calculateProgress(750, 50)).toBe(75)
  })
})

describe('calculateStrokeDashoffset', () => {
  const radius = 120
  const circumference = 2 * Math.PI * radius

  it('returns full circumference at 0% progress', () => {
    expect(calculateStrokeDashoffset(0, radius)).toBeCloseTo(circumference)
  })

  it('returns 0 at 100% progress', () => {
    expect(calculateStrokeDashoffset(100, radius)).toBeCloseTo(0)
  })

  it('returns half circumference at 50% progress', () => {
    expect(calculateStrokeDashoffset(50, radius)).toBeCloseTo(circumference / 2)
  })
})
