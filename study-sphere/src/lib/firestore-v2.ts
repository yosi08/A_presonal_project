import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
  serverTimestamp,
  DocumentSnapshot,
  getCountFromServer,
} from 'firebase/firestore'
import { db } from './firebase'

// --- User profile (settings, presets, language) ---

export interface UserProfile {
  settings: {
    theme: string
    notifications: {
      emailReminders: boolean
      studyReminders: boolean
      weeklyReport: boolean
    }
  }
  timerPresets: any[]
  language: string
  migrated?: boolean
  notesCount?: number
  sessionsCount?: number
}

const defaultProfile: UserProfile = {
  settings: {
    theme: 'light',
    notifications: {
      emailReminders: true,
      studyReminders: true,
      weeklyReport: false,
    },
  },
  timerPresets: [],
  language: 'ko',
}

export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId))
    if (!docSnap.exists()) return null
    const data = docSnap.data()
    return {
      settings: {
        ...defaultProfile.settings,
        ...data.settings,
        notifications: {
          ...defaultProfile.settings.notifications,
          ...(data.settings?.notifications ?? {}),
        },
      },
      timerPresets: data.timerPresets ?? [],
      language: data.language ?? 'ko',
      migrated: data.migrated ?? false,
      notesCount: data.notesCount ?? 0,
      sessionsCount: data.sessionsCount ?? 0,
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
    return null
  }
}

export async function updateUserProfile(
  userId: string,
  field: string,
  value: any
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      [field]: value,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error(`Error updating profile ${field}:`, error)
  }
}

// --- Sessions sub-collection ---

const sessionsRef = (userId: string) =>
  collection(db, 'users', userId, 'sessions')

export async function loadSessionsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<any[]> {
  try {
    const q = query(
      sessionsRef(userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }))
  } catch (error) {
    console.error('Error loading sessions by date range:', error)
    return []
  }
}

export async function loadAllSessions(userId: string): Promise<any[]> {
  try {
    const q = query(sessionsRef(userId), orderBy('date', 'asc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }))
  } catch (error) {
    console.error('Error loading all sessions:', error)
    return []
  }
}

export async function addSession(userId: string, session: any): Promise<string> {
  try {
    const ref = doc(sessionsRef(userId))
    await setDoc(ref, {
      ...session,
      id: ref.id,
      createdAt: serverTimestamp(),
    })
    // Update count
    const profile = await getDoc(doc(db, 'users', userId))
    const currentCount = profile.data()?.sessionsCount ?? 0
    await updateDoc(doc(db, 'users', userId), {
      sessionsCount: currentCount + 1,
      updatedAt: serverTimestamp(),
    })
    return ref.id
  } catch (error) {
    console.error('Error adding session:', error)
    return ''
  }
}

export async function updateSession(
  userId: string,
  sessionId: string,
  data: any
): Promise<void> {
  try {
    await updateDoc(doc(sessionsRef(userId), sessionId), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating session:', error)
  }
}

export async function deleteSession(
  userId: string,
  sessionId: string
): Promise<void> {
  try {
    await deleteDoc(doc(sessionsRef(userId), sessionId))
    // Update count
    const profile = await getDoc(doc(db, 'users', userId))
    const currentCount = profile.data()?.sessionsCount ?? 0
    await updateDoc(doc(db, 'users', userId), {
      sessionsCount: Math.max(0, currentCount - 1),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error deleting session:', error)
  }
}

// --- Notes sub-collection with cursor pagination ---

const notesRef = (userId: string) =>
  collection(db, 'users', userId, 'notes')

export interface PaginatedNotes {
  notes: any[]
  lastDoc: DocumentSnapshot | null
  hasMore: boolean
}

export async function loadNotesPaginated(
  userId: string,
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot | null,
  subjectFilter?: string
): Promise<PaginatedNotes> {
  try {
    const constraints: any[] = [orderBy('createdAt', 'desc'), limit(pageSize + 1)]

    if (subjectFilter && subjectFilter !== 'All') {
      constraints.unshift(where('subject', '==', subjectFilter))
    }

    if (lastDoc) {
      constraints.push(startAfter(lastDoc))
    }

    const q = query(notesRef(userId), ...constraints)
    const snapshot = await getDocs(q)
    const hasMore = snapshot.docs.length > pageSize
    const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs

    return {
      notes: docs.map((d) => ({ ...d.data(), id: d.id })),
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
      hasMore,
    }
  } catch (error) {
    console.error('Error loading paginated notes:', error)
    return { notes: [], lastDoc: null, hasMore: false }
  }
}

export async function addNote(userId: string, note: any): Promise<string> {
  try {
    const ref = doc(notesRef(userId))
    await setDoc(ref, {
      ...note,
      id: ref.id,
      createdAt: serverTimestamp(),
    })
    // Update count
    const profile = await getDoc(doc(db, 'users', userId))
    const currentCount = profile.data()?.notesCount ?? 0
    await updateDoc(doc(db, 'users', userId), {
      notesCount: currentCount + 1,
      updatedAt: serverTimestamp(),
    })
    return ref.id
  } catch (error) {
    console.error('Error adding note:', error)
    return ''
  }
}

export async function updateNote(
  userId: string,
  noteId: string,
  data: any
): Promise<void> {
  try {
    await updateDoc(doc(notesRef(userId), noteId), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating note:', error)
  }
}

export async function deleteNote(
  userId: string,
  noteId: string
): Promise<void> {
  try {
    await deleteDoc(doc(notesRef(userId), noteId))
    // Update count
    const profile = await getDoc(doc(db, 'users', userId))
    const currentCount = profile.data()?.notesCount ?? 0
    await updateDoc(doc(db, 'users', userId), {
      notesCount: Math.max(0, currentCount - 1),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error deleting note:', error)
  }
}

// --- Stats helpers ---

export async function getSessionsCount(userId: string): Promise<number> {
  try {
    const profile = await getDoc(doc(db, 'users', userId))
    return profile.data()?.sessionsCount ?? 0
  } catch {
    return 0
  }
}

export async function getNotesCount(userId: string): Promise<number> {
  try {
    const profile = await getDoc(doc(db, 'users', userId))
    return profile.data()?.notesCount ?? 0
  } catch {
    return 0
  }
}
