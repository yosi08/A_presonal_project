'use client'

import { useState } from 'react'
import { Plus, Search, X, Edit3, Trash2, BookOpen } from 'lucide-react'
import { useApp } from '@/context/AppContext'

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
    cues: '',
    notes: '',
    summary: '',
  })

  const filteredNotes = notes.filter((note) => {
    const searchContent = `${note.title} ${note.cues || ''} ${note.notes || ''} ${note.summary || ''} ${note.content || ''}`
    const matchesSearch = searchContent.toLowerCase().includes(searchTerm.toLowerCase())
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
    setNewNote({ title: '', subject: 'Other', cues: '', notes: '', summary: '' })
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
    const cornellNote = {
      ...note,
      cues: note.cues || '',
      notes: note.notes || note.content || '',
      summary: note.summary || '',
    }
    setEditingNote(cornellNote)
    setIsViewModalOpen(false)
    setIsModalOpen(true)
  }

  const openViewModal = (note) => {
    setSelectedNote(note)
    setIsViewModalOpen(true)
  }

  const getPreviewText = (note) => {
    if (note.notes) return note.notes
    if (note.content) return note.content
    return ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{t('notes')}</h1>
              <p className="text-green-100 mt-1">{t('cornellNoteDescription') || '코넬 노트 방식으로 효율적인 학습을 하세요'}</p>
            </div>
            <button
              onClick={() => {
                setEditingNote(null)
                setNewNote({ title: '', subject: 'Other', cues: '', notes: '', summary: '' })
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium shadow"
            >
              <Plus className="w-5 h-5" />
              {t('newNote')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchNotes')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Subject Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedSubject('All')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedSubject === 'All'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('noNotesFound')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || selectedSubject !== 'All'
                ? t('tryAdjusting')
                : t('createFirstNote')}
            </p>
            <button
              onClick={() => {
                setEditingNote(null)
                setNewNote({ title: '', subject: 'Other', cues: '', notes: '', summary: '' })
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
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
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800"
              >
                <div className="p-4">
                  <div
                    className="w-full h-1.5 rounded-full mb-3"
                    style={{ backgroundColor: note.color }}
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2 truncate">{note.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {getSubjectTranslation(note.subject)} • {note.date}
                  </p>

                  {/* Cornell note preview */}
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    <div className="flex min-h-[80px]">
                      {/* Cue area */}
                      <div className="w-1/3 bg-green-50 dark:bg-green-950 p-2 border-r border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Cue</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">{note.cues || '-'}</p>
                      </div>
                      {/* Notes area */}
                      <div className="w-2/3 p-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Notes</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">{getPreviewText(note) || '-'}</p>
                      </div>
                    </div>
                    {/* Summary area */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-2 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Summary</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1">{note.summary || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Note Modal - Cornell Format */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold dark:text-gray-100">
                {editingNote ? t('editNote') : t('createNote')} - {t('cornellNote') || '코넬 노트'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Title and Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('title')}</label>
                  <input
                    type="text"
                    value={editingNote ? editingNote.title : newNote.title}
                    onChange={(e) =>
                      editingNote
                        ? setEditingNote({ ...editingNote, title: e.target.value })
                        : setNewNote({ ...newNote, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={t('noteTitlePlaceholder') || '노트 제목을 입력하세요'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('subject')}</label>
                  <select
                    value={editingNote ? editingNote.subject : newNote.subject}
                    onChange={(e) =>
                      editingNote
                        ? setEditingNote({ ...editingNote, subject: e.target.value })
                        : setNewNote({ ...newNote, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {SUBJECTS.map((subject) => (
                      <option key={subject.name} value={subject.name}>
                        {getSubjectTranslation(subject.name)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cornell Note Structure */}
              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                {/* Main Content Area */}
                <div className="flex flex-col sm:flex-row min-h-[300px]">
                  {/* Cue Column */}
                  <div className="sm:w-1/3 bg-green-50 dark:bg-green-950 border-b sm:border-b-0 sm:border-r border-gray-300 dark:border-gray-600">
                    <div className="p-3 border-b border-gray-300 dark:border-gray-600 bg-green-100 dark:bg-green-900">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 text-sm">{t('cueColumn') || '단서/질문'}</h4>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{t('cueDescription') || '키워드, 질문, 핵심 개념'}</p>
                    </div>
                    <textarea
                      value={editingNote ? editingNote.cues : newNote.cues}
                      onChange={(e) =>
                        editingNote
                          ? setEditingNote({ ...editingNote, cues: e.target.value })
                          : setNewNote({ ...newNote, cues: e.target.value })
                      }
                      className="w-full h-[200px] sm:h-[calc(100%-60px)] p-3 bg-transparent resize-none focus:outline-none text-sm dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder={t('cuePlaceholder') || '• 주요 키워드\n• 핵심 질문\n• 중요 개념'}
                    />
                  </div>

                  {/* Notes Column */}
                  <div className="sm:w-2/3">
                    <div className="p-3 border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{t('notesColumn') || '노트'}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{t('notesDescription') || '수업 내용, 상세 설명, 예시'}</p>
                    </div>
                    <textarea
                      value={editingNote ? editingNote.notes : newNote.notes}
                      onChange={(e) =>
                        editingNote
                          ? setEditingNote({ ...editingNote, notes: e.target.value })
                          : setNewNote({ ...newNote, notes: e.target.value })
                      }
                      className="w-full h-[200px] sm:h-[calc(100%-60px)] p-3 resize-none focus:outline-none text-sm dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder={t('notesPlaceholder') || '수업이나 학습 내용을 자세히 기록하세요...'}
                    />
                  </div>
                </div>

                {/* Summary Section */}
                <div className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{t('summarySection') || '요약'}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{t('summaryDescription') || '핵심 내용을 2-3문장으로 요약'}</p>
                  </div>
                  <textarea
                    value={editingNote ? editingNote.summary : newNote.summary}
                    onChange={(e) =>
                      editingNote
                        ? setEditingNote({ ...editingNote, summary: e.target.value })
                        : setNewNote({ ...newNote, summary: e.target.value })
                    }
                    rows={3}
                    className="w-full p-3 bg-transparent resize-none focus:outline-none text-sm dark:text-gray-100 dark:placeholder-gray-500"
                    placeholder={t('summaryPlaceholder') || '학습한 내용의 핵심을 요약하세요...'}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={editingNote ? handleUpdateNote : handleAddNote}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {editingNote ? t('saveChanges') : t('createNote')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Note Modal - Cornell Format */}
      {isViewModalOpen && selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsViewModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div
                className="w-full h-1.5 rounded-full mb-3"
                style={{ backgroundColor: selectedNote.color }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedNote.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {getSubjectTranslation(selectedNote.subject)} • {selectedNote.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(selectedNote)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                    title={t('edit')}
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors text-red-500"
                    title={t('delete')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Cornell Note View */}
            <div className="p-6">
              <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                {/* Main Content Area */}
                <div className="flex flex-col sm:flex-row min-h-[300px]">
                  {/* Cue Column */}
                  <div className="sm:w-1/3 bg-green-50 dark:bg-green-950 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-600">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-green-100 dark:bg-green-900">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 text-sm">{t('cueColumn') || '단서/질문'}</h4>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedNote.cues || <span className="text-gray-400 italic">{t('noCues') || '단서가 없습니다'}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Notes Column */}
                  <div className="sm:w-2/3">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{t('notesColumn') || '노트'}</h4>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedNote.notes || selectedNote.content || <span className="text-gray-400 italic">{t('noNotes') || '노트가 없습니다'}</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="border-t-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{t('summarySection') || '요약'}</h4>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedNote.summary || <span className="text-gray-400 italic">{t('noSummary') || '요약이 없습니다'}</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
