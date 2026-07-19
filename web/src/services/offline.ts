import { ref, computed, onMounted, onUnmounted } from 'vue'
import { addPendingSync, getPendingSyncs, clearPendingSync, type DexiePendingSync } from './db'

const online = ref(navigator.onLine)

function handleOnline() {
  online.value = true
  processSyncQueue()
}

function handleOffline() {
  online.value = false
}

export function useOnlineStatus() {
  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })
  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  const isOnline = computed(() => online.value)
  const isOffline = computed(() => !online.value)

  return { isOnline, isOffline }
}

export async function queueOfflineAction(
  type: DexiePendingSync['type'],
  action: DexiePendingSync['action'],
  data: any
) {
  await addPendingSync(type, action, data)
}

export async function processSyncQueue() {
  const syncs = await getPendingSyncs()
  for (const sync of syncs) {
    try {
      await syncItem(sync)
      await clearPendingSync(sync.id!)
    } catch (err) {
      console.warn('Sync failed, will retry later:', sync.type, sync.action, err)
      break
    }
  }
}

async function syncItem(sync: DexiePendingSync) {
  const { supabase } = await import('./supabase')

  switch (sync.type) {
    case 'workout': {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('No auth session')

      if (sync.action === 'create') {
        const { error } = await supabase.from('workouts').insert({
          user_id: session.user.id,
          routine_name: sync.data.routineName,
          exercises: sync.data.exercises,
          duration: sync.data.duration || 0,
          volume: sync.data.volume || 0,
          total_sets: sync.data.totalSets || 0,
          created_at: sync.data.created_at,
        })
        if (error) throw error
      }
      break
    }
    case 'user': {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('No auth session')

      if (sync.action === 'update') {
        const { error } = await supabase
          .from('profiles')
          .upsert({ id: session.user.id, ...sync.data, updated_at: new Date().toISOString() })
        if (error) throw error
      }
      break
    }
  }
}

export function setupPeriodicSync(intervalMs = 60000) {
  if (navigator.onLine) processSyncQueue()
  return setInterval(() => {
    if (navigator.onLine) processSyncQueue()
  }, intervalMs)
}
