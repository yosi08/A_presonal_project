import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export interface UserData {
  sessions: any[]
  notes: any[]
  timerPresets: any[]
  settings: {
    theme: string
    notifications: {
      emailReminders: boolean
      studyReminders: boolean
      weeklyReport: boolean
    }
  }
  language: string
}

const defaultUserData: UserData = {
  sessions: [],
  notes: [],
  timerPresets: [],
  settings: {
    theme: 'light',
    notifications: {
      emailReminders: true,
      studyReminders: true,
      weeklyReport: false,
    },
  },
  language: 'ko',
}

function userDocRef(userId: string) {
  return doc(db, 'users', userId)
}

export async function loadUserData(userId: string): Promise<UserData | null> {
  try {
    const docSnap = await getDoc(userDocRef(userId))
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        sessions: data.sessions ?? defaultUserData.sessions,
        notes: data.notes ?? defaultUserData.notes,
        timerPresets: data.timerPresets ?? defaultUserData.timerPresets,
        settings: {
          ...defaultUserData.settings,
          ...data.settings,
          notifications: {
            ...defaultUserData.settings.notifications,
            ...(data.settings?.notifications ?? {}),
          },
        },
        language: data.language ?? defaultUserData.language,
      }
    }
    return null
  } catch (error) {
    console.error('Error loading user data from Firestore:', error)
    return null
  }
}

export async function initializeUserData(userId: string): Promise<UserData> {
  try {
    await setDoc(userDocRef(userId), {
      ...defaultUserData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return defaultUserData
  } catch (error) {
    console.error('Error initializing user data in Firestore:', error)
    return defaultUserData
  }
}

export async function updateUserField(
  userId: string,
  field: keyof UserData,
  value: any
): Promise<void> {
  try {
    await updateDoc(userDocRef(userId), {
      [field]: value,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error(`Error updating ${field} in Firestore:`, error)
  }
}

export async function saveAllUserData(
  userId: string,
  data: Partial<UserData>
): Promise<void> {
  try {
    await setDoc(
      userDocRef(userId),
      {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error saving all user data to Firestore:', error)
  }
}

export async function deleteUserData(userId: string): Promise<void> {
  try {
    await deleteDoc(userDocRef(userId))
  } catch (error) {
    console.error('Error deleting user data from Firestore:', error)
  }
}
