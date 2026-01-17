import { useState } from 'react'
import { Plus, Search, X, Edit3, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

const SUBJECTS = [
  { name: 'Mathematics', color: 'rgb(99, 102, 241)' },
  { name: 'Physics', color: 'rgb(244, 63, 94)' },
  { name: 'Chemistry', color: 'rgb(34, 197, 94)' },
  { name: 'Biology', color: 'rgb(168, 85, 247)' },
  { name: 'Computer Science', color: 'rgb(59, 130, 246)' },
  { name: 'Other', color: 'rgb(100, 116, 139)' },
]

export default function Notes() {
  const { t, notes, setNotes } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [newNote, setNewNote] = useState({
    title: '',
    subject: 'Other',
    content: '',
  })

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  const getSubjectColor = (subject) => {
    const found = SUBJECTS.find((s) => s.name === subject)
    return found ? found.color : 'rgb(100, 116, 139)'
  }

  const getSubjectTranslation = (subject) => {
    const subjectMap = {
      'Mathematics': t('mathematics'),
      'Physics': t('physics'),
      'Chemistry': t('chemistry'),
      'Biology': t('biology'),
      'Computer Science': t('computerScience'),
      'Other': t('other'),
    }
    return subjectMap[subject] || subject
  }

  const handleAddNote = () => {
    if (!newNote.title) return

    const note = {
      id: Date.now(),
      ...newNote,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      color: getSubjectColor(newNote.subject),
    }

    setNotes([note, ...notes])
    setNewNote({ title: '', subject: 'Other', content: '' })
    setIsModalOpen(false)
  }

  const handleUpdateNote = () => {
    if (!editingNote.title) return

    setNotes(
      notes.map((note) =>
        note.id === editingNote.id
          ? { ...editingNote, color: getSubjectColor(editingNote.subject) }
          : note
      )
    )
    setEditingNote(null)
    setIsModalOpen(false)
  }

  const handleDeleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id))
    setIsViewModalOpen(false)
    setSelectedNote(null)
  }

  const openEditModal = (note) => {
    setEditingNote({ ...note })
    setIsViewModalOpen(false)
    setIsModalOpen(true)
  }

  const openViewModal = (note) => {
    setSelectedNote(note)
    setIsViewModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{t('notes')}</h1>
              <p className="text-indigo-100 mt-1">{t('organizeNotes')}</p>
            </div>
            <button
              onClick={() => {
                setEditingNote(null)
                setNewNote({ title: '', subject: 'Other', content: '' })
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-medium shadow"
            >
              <Plus className="w-5 h-5" />
              {t('newNote')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchNotes')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Subject Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedSubject('All')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedSubject === 'All'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('all')}
              </button>
              {SUBJECTS.map((subject) => (
                <button
                  key={subject.name}
                  onClick={() => setSelectedSubject(subject.name)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedSubject === subject.name
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={
                    selectedSubject === subject.name
                      ? { backgroundColor: subject.color }
                      : {}
                  }
                >
                  {getSubjectTranslation(subject.name)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noNotesFound')}</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedSubject !== 'All'
                ? t('tryAdjusting')
                : t('createFirstNote')}
            </p>
            <button
              onClick={() => {
                setEditingNote(null)
                setNewNote({ title: '', subject: 'Other', content: '' })
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              {t('createNote')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => openViewModal(note)}
                className="bg-white rounded-xl shadow-lg p-5 cursor-pointer hover:shadow-xl transition-shadow border border-gray-100 hover:border-indigo-200"
              >
                <div
                  className="w-full h-1.5 rounded-full mb-4"
                  style={{ backgroundColor: note.color }}
                />
                <h3 className="font-semibold text-gray-900 text-lg mb-2 truncate">{note.title}</h3>
                <p className="text-sm text-gray-500 mb-3">
                  {getSubjectTranslation(note.subject)} • {note.date}
                </p>
                <p className="text-gray-600 text-sm line-clamp-3 whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingNote ? t('editNote') : t('createNote')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('title')}</label>
                <input
                  type="text"
                  value={editingNote ? editingNote.title : newNote.title}
                  onChange={(e) =>
                    editingNote
                      ? setEditingNote({ ...editingNote, title: e.target.value })
                      : setNewNote({ ...newNote, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Note title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('subject')}</label>
                <select
                  value={editingNote ? editingNote.subject : newNote.subject}
                  onChange={(e) =>
                    editingNote
                      ? setEditingNote({ ...editingNote, subject: e.target.value })
                      : setNewNote({ ...newNote, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {SUBJECTS.map((subject) => (
                    <option key={subject.name} value={subject.name}>
                      {getSubjectTranslation(subject.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('content')}</label>
                <textarea
                  value={editingNote ? editingNote.content : newNote.content}
                  onChange={(e) =>
                    editingNote
                      ? setEditingNote({ ...editingNote, content: e.target.value })
                      : setNewNote({ ...newNote, content: e.target.value })
                  }
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Write your notes here..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={editingNote ? handleUpdateNote : handleAddNote}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingNote ? t('saveChanges') : t('createNote')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Note Modal */}
      {isViewModalOpen && selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsViewModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div
              className="w-full h-2 rounded-full mb-4"
              style={{ backgroundColor: selectedNote.color }}
            />
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedNote.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {getSubjectTranslation(selectedNote.subject)} • {selectedNote.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedNote)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                  title={t('edit')}
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                  title={t('delete')}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedNote.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
