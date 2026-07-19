import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
  db: {
    schema: 'public',
  },
})

export const auth = {
  signUp: async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  signInAnonymously: async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously()
      return { data, error }
    } catch (error: any) {
      return { data: null, error }
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  sendMagicLink: async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin + '/app/home',
      },
    })
    return { data, error }
  },
}

export const profiles = {
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  updateProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    return { data, error }
  },

  createProfile: async (userId: string, onboardingData: any) => {
    try {
      const profileData = {
        id: userId,
        ...onboardingData,
        profile_percentage: onboardingData.profile_percentage || 63,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const { data, error } = await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'id' })
      return { data, error: error ? { message: error.message } : null }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Profil oluşturulamadı' } }
    }
  },
}

export const workouts = {
  getRoutines: async () => {
    const { data, error } = await supabase
      .from('routines')
      .select('*, categories(*), equipment(*)')
    return { data, error }
  },

  getRoutineById: async (routineId: number) => {
    const { data, error } = await supabase
      .from('routines')
      .select('*, categories(*), equipment(*)')
      .eq('id', routineId)
      .single()
    return { data, error }
  },

  saveWorkout: async (workoutData: any) => {
    const { data, error } = await supabase
      .from('workouts')
      .insert([workoutData])
      .select()
      .single()
    return { data, error }
  },
}

export const categories = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
      if (error) return { error: error.message }
      return { data }
    } catch (error) {
      return { error: 'Kategoriler alınırken bir hata oluştu' }
    }
  },
}
