export function filterNotes(
  notes: any[],
  searchTerm: string,
  selectedSubject: string
): any[] {
  return notes.filter((note) => {
    const searchContent = `${note.title} ${note.cues || ''} ${note.notes || ''} ${note.summary || ''} ${note.content || ''}`
    const matchesSearch = searchContent.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject
    return matchesSearch && matchesSubject
  })
}
