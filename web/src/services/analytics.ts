import { supabase } from './supabase'

async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export const AnalyticsService = {
  async logEvent(eventName: string, params?: Record<string, any>) {
    try {
      const userId = await getUserId()
      await supabase.from('analytics_events').insert({
        user_id: userId,
        event_name: eventName,
        params,
        url: window.location.pathname,
        created_at: new Date().toISOString(),
      })
    } catch {}
  },

  async logScreenView(screenName: string) {
    await this.logEvent('screen_view', { screen_name: screenName })
  },

  async setUserId(_userId: string) {},
  async setUserProperty(_name: string, _value: string) {},

  async logLogin(method: string) {
    await this.logEvent('login', { method })
  },

  async logSignUp(method: string) {
    await this.logEvent('sign_up', { method })
  },

  async logWorkoutStarted(workoutType: string, duration?: number) {
    await this.logEvent('workout_started', { workout_type: workoutType, duration })
  },

  async logWorkoutCompleted(workoutType: string, duration: number) {
    await this.logEvent('workout_completed', { workout_type: workoutType, duration })
  },

  async logSettingsChanged(settingName: string, value: string) {
    await this.logEvent('settings_changed', { setting_name: settingName, value })
  },
}
