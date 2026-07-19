import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  saveWorkoutToDB,
  getAllWorkoutsFromDB,
  deleteWorkoutFromDB,
  getWorkoutFromDB,
} from '@/services/db'
import { queueOfflineAction } from '@/services/offline'

export interface ExerciseSet {
  id?: number
  weight: string | number
  reps: string
  isCompleted: boolean
}

export interface Exercise {
  id?: number | string
  name: string
  icon?: string
  description?: string
  restTime?: string
  sets: ExerciseSet[]
}

export interface Workout {
  id: string
  routineName: string
  exercises: Exercise[]
  duration?: number
  volume?: number
  totalSets?: number
  created_at: string
  updated_at: string
}

export const useWorkoutStore = defineStore('workout', () => {
  const workouts = ref<Workout[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastSync = ref<number | null>(null)
  const initialized = ref(false)

  const workoutCount = computed(() => workouts.value.length)
  const lastWorkout = computed(() =>
    workouts.value.length > 0
      ? workouts.value.reduce((latest, w) =>
          new Date(w.created_at) > new Date(latest.created_at) ? w : latest
        )
      : null
  )

  async function loadFromStorage() {
    loading.value = true
    try {
      const data = await getAllWorkoutsFromDB()
      workouts.value = data.map(d => ({
        id: d.id,
        routineName: d.routineName,
        exercises: d.exercises || [],
        duration: d.duration,
        volume: d.volume,
        totalSets: d.totalSets,
        created_at: d.created_at,
        updated_at: d.updated_at,
      }))
      initialized.value = true
      lastSync.value = Date.now()
    } catch (err) {
      error.value = 'Workouts could not be loaded'
    } finally {
      loading.value = false
    }
  }

  async function addWorkout(workoutData: Workout) {
    workouts.value.push(workoutData)
    await saveWorkoutToDB({
      id: workoutData.id,
      routineName: workoutData.routineName,
      exercises: workoutData.exercises,
      duration: workoutData.duration,
      volume: workoutData.volume,
      totalSets: workoutData.totalSets,
      created_at: workoutData.created_at,
      updated_at: workoutData.updated_at,
      synced: false,
    })
    lastSync.value = Date.now()

    if (navigator.onLine) {
      await queueOfflineAction('workout', 'create', workoutData)
    }
  }

  async function removeWorkout(workoutId: string) {
    workouts.value = workouts.value.filter(w => w.id !== workoutId)
    await deleteWorkoutFromDB(workoutId)
    lastSync.value = Date.now()
  }

  async function updateWorkout(workoutId: string, updates: Partial<Workout>) {
    const index = workouts.value.findIndex(w => w.id === workoutId)
    if (index !== -1) {
      const updated = { ...workouts.value[index], ...updates }
      workouts.value[index] = updated
      await saveWorkoutToDB({
        id: updated.id,
        routineName: updated.routineName,
        exercises: updated.exercises,
        duration: updated.duration,
        volume: updated.volume,
        totalSets: updated.totalSets,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
        synced: false,
      })
      lastSync.value = Date.now()
    }
  }

  function clearError() {
    error.value = null
  }

  function resetWorkouts() {
    workouts.value = []
    initialized.value = false
    lastSync.value = null
  }

  return {
    workouts, loading, error, lastSync, initialized,
    workoutCount, lastWorkout,
    loadFromStorage, addWorkout, removeWorkout, updateWorkout,
    clearError, resetWorkouts,
  }
})
