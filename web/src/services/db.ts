import Dexie, { type Table } from 'dexie'

export interface DexieWorkout {
  id: string
  routineName: string
  exercises: any[]
  duration?: number
  volume?: number
  totalSets?: number
  created_at: string
  updated_at: string
  synced: boolean
}

export interface DexieUserData {
  key: string
  value: any
  updated_at: string
}

export interface DexiePendingSync {
  id?: number
  type: 'workout' | 'user' | 'stats'
  action: 'create' | 'update' | 'delete'
  data: any
  created_at: string
  retries: number
}

class LogPressDB extends Dexie {
  workouts!: Table<DexieWorkout, string>
  userData!: Table<DexieUserData, string>
  pendingSync!: Table<DexiePendingSync, number>
  settings!: Table<{ key: string; value: any }, string>

  constructor() {
    super('LogPressDB')
    this.version(1).stores({
      workouts: 'id, routineName, created_at, synced',
      userData: 'key',
      pendingSync: '++id, type, created_at',
      settings: 'key',
    })
  }
}

export const db = new LogPressDB()

export async function saveWorkoutToDB(workout: DexieWorkout) {
  await db.workouts.put({ ...workout, synced: false })
}

export async function getAllWorkoutsFromDB(): Promise<DexieWorkout[]> {
  return db.workouts.orderBy('created_at').reverse().toArray()
}

export async function getWorkoutFromDB(id: string): Promise<DexieWorkout | undefined> {
  return db.workouts.get(id)
}

export async function deleteWorkoutFromDB(id: string) {
  await db.workouts.delete(id)
}

export async function saveUserDataToDB(key: string, value: any) {
  await db.userData.put({ key, value, updated_at: new Date().toISOString() })
}

export async function getUserDataFromDB(key: string): Promise<any | null> {
  const entry = await db.userData.get(key)
  return entry?.value ?? null
}

export async function deleteUserDataFromDB(key: string) {
  await db.userData.delete(key)
}

export async function saveSettingToDB(key: string, value: any) {
  await db.settings.put({ key, value })
}

export async function getSettingFromDB(key: string): Promise<any | null> {
  const entry = await db.settings.get(key)
  return entry?.value ?? null
}

export async function addPendingSync(type: DexiePendingSync['type'], action: DexiePendingSync['action'], data: any) {
  await db.pendingSync.add({
    type,
    action,
    data,
    created_at: new Date().toISOString(),
    retries: 0,
  })
}

export async function getPendingSyncs(): Promise<DexiePendingSync[]> {
  return db.pendingSync.orderBy('created_at').toArray()
}

export async function clearPendingSync(id: number) {
  await db.pendingSync.delete(id)
}

export async function clearAllData() {
  await db.workouts.clear()
  await db.userData.clear()
  await db.pendingSync.clear()
  await db.settings.clear()
}
