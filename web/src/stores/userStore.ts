import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  saveUserDataToDB,
  getUserDataFromDB,
  deleteUserDataFromDB,
} from '@/services/db'
import { queueOfflineAction } from '@/services/offline'

export interface User {
  id: string
  display_name: string
  name?: string
  gender: string
  age: number
  weight: number
  height: number
  aim: string
  experience: string
  exercise_hours: string
  focus_areas?: number[]
  sports?: number[]
  environment_preference?: string
  profile_percentage: number
  ls_score: number
  user_role_id: number
  skill_level: string
  leaderboard_points: number
  bmi?: number
  bmi_category?: string
  profile_image_url?: string
  bio?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  website?: string
  created_at: string
  updated_at: string
}

export interface UserStats {
  total_workouts: number
  total_exercises: number
  total_weight: number
  total_time: number
  current_streak: number
  max_streak: number
  last_workout_date: string
  overall_rating: number
  muscle_groups?: Record<string, number>
  ai_analysis_summary?: string
  ai_recommendations?: string
  ai_analyzed_at?: string
}

const USER_KEY = 'logpress_user'
const STATS_KEY = 'logpress_user_stats'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const userStats = ref<UserStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastSync = ref<number | null>(null)
  const initialized = ref(false)

  const isLoggedIn = computed(() => !!user.value)

  async function loadFromStorage() {
    const stored = await getUserDataFromDB(USER_KEY)
    const storedStats = await getUserDataFromDB(STATS_KEY)
    if (stored) user.value = stored
    if (storedStats) userStats.value = storedStats
    initialized.value = true
    lastSync.value = Date.now()
  }

  async function addUser(userData: User) {
    user.value = userData
    await saveUserDataToDB(USER_KEY, userData)
    lastSync.value = Date.now()
    if (navigator.onLine) {
      await queueOfflineAction('user', 'update', userData)
    }
  }

  async function removeUser() {
    user.value = null
    userStats.value = null
    await deleteUserDataFromDB(USER_KEY)
    await deleteUserDataFromDB(STATS_KEY)
    lastSync.value = Date.now()
  }

  async function updateUser(updates: Partial<User>) {
    if (!user.value) return
    user.value = { ...user.value, ...updates }
    await saveUserDataToDB(USER_KEY, user.value)
    lastSync.value = Date.now()
    if (navigator.onLine) {
      await queueOfflineAction('user', 'update', updates)
    }
  }

  async function saveUserStats(stats: UserStats) {
    userStats.value = stats
    await saveUserDataToDB(STATS_KEY, stats)
  }

  function incrementScore(points: number) {
    if (!user.value) return
    user.value.ls_score += points
    user.value.leaderboard_points += points
    saveUserDataToDB(USER_KEY, user.value)
  }

  function clearError() {
    error.value = null
  }

  return {
    user, userStats, loading, error, lastSync, initialized,
    isLoggedIn,
    loadFromStorage, addUser, removeUser, updateUser,
    saveUserStats, incrementScore, clearError,
  }
})
