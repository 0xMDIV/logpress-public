import { initializeApp } from 'firebase/app'
import {
  getAnalytics,
  logEvent as fbLogEvent,
  setUserId as fbSetUserId,
  setUserProperties as fbSetUserProperties,
  isSupported,
  type Analytics,
} from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

let analytics: Analytics | null = null

async function initAnalytics() {
  if (analytics) return
  try {
    const supported = await isSupported()
    if (!supported) {
      console.warn('Firebase Analytics not supported in this environment')
      return
    }
    const app = initializeApp(firebaseConfig)
    analytics = getAnalytics(app)
  } catch (err) {
    console.warn('Firebase Analytics init failed:', err)
  }
}

initAnalytics()

export const AnalyticsService = {
  async logEvent(eventName: string, params?: Record<string, any>) {
    if (!analytics) return
    try {
      fbLogEvent(analytics, eventName, params)
    } catch {}
  },

  async logScreenView(screenName: string) {
    await this.logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenName,
    })
  },

  async setUserId(userId: string) {
    if (!analytics) return
    try {
      fbSetUserId(analytics, userId)
    } catch {}
  },

  async setUserProperty(name: string, value: string) {
    if (!analytics) return
    try {
      fbSetUserProperties(analytics, { [name]: value })
    } catch {}
  },

  async logLogin(method: string) {
    await this.logEvent('login', { method })
  },

  async logSignUp(method: string) {
    await this.logEvent('sign_up', { method })
  },

  async logWorkoutStarted(workoutType: string, duration?: number) {
    await this.logEvent('workout_started', {
      workout_type: workoutType,
      duration,
    })
  },

  async logWorkoutCompleted(workoutType: string, duration: number) {
    await this.logEvent('workout_completed', {
      workout_type: workoutType,
      duration,
    })
  },

  async logSettingsChanged(settingName: string, value: string) {
    await this.logEvent('settings_changed', {
      setting_name: settingName,
      value,
    })
  },
}
