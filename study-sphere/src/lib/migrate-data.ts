import {
  doc,
  getDoc,
  writeBatch,
  collection,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const BATCH_SIZE = 450

export async function migrateUserData(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) return false

    const data = userDoc.data()

    // Skip if already migrated
    if (data.migrated === true) return false

    const sessions = data.sessions ?? []
    const notes = data.notes ?? []

    // Nothing to migrate
    if (sessions.length === 0 && notes.length === 0) {
      await updateDoc(doc(db, 'users', userId), {
        migrated: true,
        notesCount: 0,
        sessionsCount: 0,
        updatedAt: serverTimestamp(),
      })
      return false
    }

    // Split into chunks for batch writes (Firestore batch limit is 500)
    const allItems = [
      ...sessions.map((s: any) => ({ type: 'session', data: s })),
      ...notes.map((n: any) => ({ type: 'note', data: n })),
    ]

    for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
      const chunk = allItems.slice(i, i + BATCH_SIZE)
      const batch = writeBatch(db)

      for (const item of chunk) {
        const collectionName = item.type === 'session' ? 'sessions' : 'notes'
        const ref = doc(collection(db, 'users', userId, collectionName))
        batch.set(ref, {
          ...item.data,
          id: ref.id,
          createdAt: serverTimestamp(),
        })
      }

      await batch.commit()
    }

    // Mark as migrated and update counts, clear old arrays
    await updateDoc(doc(db, 'users', userId), {
      migrated: true,
      notesCount: notes.length,
      sessionsCount: sessions.length,
      sessions: [],
      notes: [],
      updatedAt: serverTimestamp(),
    })

    console.log(
      `Migration complete: ${sessions.length} sessions, ${notes.length} notes migrated to sub-collections`
    )
    return true
  } catch (error) {
    console.error('Error during data migration:', error)
    return false
  }
}
