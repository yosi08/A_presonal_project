import { filterNotes } from '../notes'

const mockNotes = [
  {
    id: 1,
    title: 'Math Homework',
    subject: 'Mathematics',
    cues: 'algebra',
    notes: 'equations',
    summary: 'linear algebra basics',
    content: '',
  },
  {
    id: 2,
    title: 'Physics Lab',
    subject: 'Physics',
    cues: 'velocity',
    notes: 'motion',
    summary: 'kinematics',
    content: '',
  },
  {
    id: 3,
    title: 'Chem Notes',
    subject: 'Chemistry',
    cues: '',
    notes: 'atoms',
    summary: '',
    content: '',
  },
]

describe('filterNotes', () => {
  it('returns all notes with empty search and All subject', () => {
    expect(filterNotes(mockNotes, '', 'All')).toHaveLength(3)
  })

  it('filters by search term case-insensitively', () => {
    expect(filterNotes(mockNotes, 'MATH', 'All')).toHaveLength(1)
  })

  it('filters by subject', () => {
    expect(filterNotes(mockNotes, '', 'Physics')).toHaveLength(1)
  })

  it('combines search and subject filters (AND logic)', () => {
    expect(filterNotes(mockNotes, 'velocity', 'Physics')).toHaveLength(1)
    expect(filterNotes(mockNotes, 'velocity', 'Mathematics')).toHaveLength(0)
  })

  it('searches across cues field', () => {
    expect(filterNotes(mockNotes, 'algebra', 'All')).toHaveLength(1)
  })

  it('searches across notes field', () => {
    expect(filterNotes(mockNotes, 'equations', 'All')).toHaveLength(1)
  })

  it('searches across summary field', () => {
    expect(filterNotes(mockNotes, 'kinematics', 'All')).toHaveLength(1)
  })

  it('returns empty array when no matches', () => {
    expect(filterNotes(mockNotes, 'nonexistent', 'All')).toHaveLength(0)
  })

  it('handles empty notes array', () => {
    expect(filterNotes([], 'test', 'All')).toHaveLength(0)
  })

  it('handles notes with missing optional fields', () => {
    const notesWithMissing = [
      { id: 4, title: 'Test', subject: 'Other' },
    ]
    expect(filterNotes(notesWithMissing, 'Test', 'All')).toHaveLength(1)
  })
})
