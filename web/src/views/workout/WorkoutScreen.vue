<template>
  <div class="page">
    <div class="header-actions">
      <button class="btn-primary" @click="$router.push('/app/workout/ready-routines')">
        {{ $t('ready_routines') }}
      </button>
      <button class="btn-secondary" @click="createNewRoutine">
        + {{ $t('new_routine') }}
      </button>
    </div>

    <h2>{{ $t('my_routines') }}</h2>

    <div v-if="workoutStore.loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="workoutStore.workouts.length === 0" class="empty">
      <p>{{ $t('no_workouts_yet') }}</p>
      <p class="empty-hint">{{ $t('create_or_discover') }}</p>
    </div>

    <div v-else class="routine-list">
      <div v-for="w in routineList" :key="w.id" class="routine-card">
        <div class="routine-info" @click="startTracking(w)">
          <span class="routine-name">{{ w.routineName }}</span>
          <span class="routine-exercises">
            {{ w.exercises?.length || 0 }} {{ $t('exercises') }}
          </span>
          <div class="exercise-preview">
            {{ exercisePreview(w) }}
          </div>
        </div>
        <button class="btn-start" @click="startTracking(w)">
          {{ $t('start') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutStore, type Workout } from '@/stores/workoutStore'

const router = useRouter()
const workoutStore = useWorkoutStore()

onMounted(() => {
  workoutStore.loadFromStorage()
})

const routineList = computed(() => {
  const seen = new Map<string, Workout>()
  workoutStore.workouts.forEach(w => {
    seen.set(w.routineName, w)
  })
  return Array.from(seen.values())
})

function exercisePreview(w: Workout): string {
  if (!w.exercises?.length) return ''
  return w.exercises.slice(0, 3).map(e => e.name).join(', ') + (w.exercises.length > 3 ? '...' : '')
}

function createNewRoutine() {
  router.push('/app/workout/create')
}

function startTracking(w: Workout) {
  const routine = {
    id: w.id,
    routineName: w.routineName,
    exercises: w.exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      sets: ex.sets.map(s => ({ ...s })),
      isExpanded: true,
    })),
  }
  router.push({
    name: 'WorkoutTracking',
    params: { id: w.id },
    state: { routine },
  })
}
</script>

<style scoped>
.page { padding: 16px; color: white; }
.header-actions { display: flex; gap: 10px; margin-bottom: 24px; }
.btn-primary, .btn-secondary { flex: 1; padding: 14px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
.btn-primary { background: linear-gradient(135deg, #6c63ff, #e040fb); color: white; }
.btn-secondary { background: #1a1a2e; color: white; border: 1px solid #2a2a3e; }
h2 { font-size: 20px; margin-bottom: 16px; }
.loading, .empty { text-align: center; padding: 48px 0; color: #666; }
.empty-hint { font-size: 13px; margin-top: 8px; }
.spinner { width: 32px; height: 32px; border: 3px solid #2a2a3e; border-top-color: #6c63ff; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.routine-list { display: flex; flex-direction: column; gap: 10px; }
.routine-card { display: flex; background: #1a1a2e; border-radius: 12px; padding: 14px; gap: 12px; }
.routine-info { flex: 1; cursor: pointer; }
.routine-name { font-size: 16px; font-weight: 600; display: block; margin-bottom: 4px; }
.routine-exercises { font-size: 12px; color: #888; }
.exercise-preview { font-size: 12px; color: #555; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.btn-start { padding: 8px 20px; border-radius: 10px; background: #6c63ff; color: white; border: none; font-size: 13px; font-weight: 600; cursor: pointer; align-self: center; white-space: nowrap; }
</style>
