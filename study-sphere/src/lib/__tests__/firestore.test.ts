jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
}))
jest.mock('../firebase', () => ({ db: 'mock-db' }))

import {
  loadUserData,
  initializeUserData,
  updateUserField,
  saveAllUserData,
  deleteUserData,
} from '../firestore'
import { getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('loadUserData', () => {
  it('returns null when document does not exist', async () => {
    ;(getDoc as jest.Mock).mockResolvedValue({ exists: () => false })
    const result = await loadUserData('user123')
    expect(result).toBeNull()
  })

  it('returns merged data with defaults when document exists', async () => {
    ;(getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({
        sessions: [{ id: 1 }],
        notes: [],
        language: 'en',
      }),
    })
    const result = await loadUserData('user123')
    expect(result).not.toBeNull()
    expect(result!.sessions).toEqual([{ id: 1 }])
    expect(result!.language).toBe('en')
    expect(result!.timerPresets).toEqual([])
    expect(result!.settings.notifications.emailReminders).toBe(true)
  })

  it('returns null on error', async () => {
    ;(getDoc as jest.Mock).mockRejectedValue(new Error('network'))
    const result = await loadUserData('user123')
    expect(result).toBeNull()
  })
})

describe('initializeUserData', () => {
  it('calls setDoc and returns default data', async () => {
    ;(setDoc as jest.Mock).mockResolvedValue(undefined)
    const result = await initializeUserData('user123')
    expect(setDoc).toHaveBeenCalled()
    expect(result.language).toBe('ko')
    expect(result.sessions).toEqual([])
  })

  it('returns default data on error', async () => {
    ;(setDoc as jest.Mock).mockRejectedValue(new Error('write error'))
    const result = await initializeUserData('user123')
    expect(result.language).toBe('ko')
  })
})

describe('updateUserField', () => {
  it('calls updateDoc with correct field', async () => {
    ;(updateDoc as jest.Mock).mockResolvedValue(undefined)
    await updateUserField('user123', 'language', 'en')
    expect(updateDoc).toHaveBeenCalled()
  })

  it('does not throw on error', async () => {
    ;(updateDoc as jest.Mock).mockRejectedValue(new Error('fail'))
    await expect(updateUserField('user123', 'language', 'en')).resolves.toBeUndefined()
  })
})

describe('saveAllUserData', () => {
  it('calls setDoc with merge option', async () => {
    ;(setDoc as jest.Mock).mockResolvedValue(undefined)
    await saveAllUserData('user123', { language: 'en' })
    expect(setDoc).toHaveBeenCalled()
    // Check merge option
    const call = (setDoc as jest.Mock).mock.calls[0]
    expect(call[2]).toEqual({ merge: true })
  })
})

describe('deleteUserData', () => {
  it('calls deleteDoc', async () => {
    ;(deleteDoc as jest.Mock).mockResolvedValue(undefined)
    await deleteUserData('user123')
    expect(deleteDoc).toHaveBeenCalled()
  })

  it('does not throw on error', async () => {
    ;(deleteDoc as jest.Mock).mockRejectedValue(new Error('fail'))
    await expect(deleteUserData('user123')).resolves.toBeUndefined()
  })
})
