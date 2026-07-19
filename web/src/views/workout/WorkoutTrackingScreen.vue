<template>
  <div class="page">
    <header class="header">
      <button class="btn-back" @click="confirmExit">&larr;</button>
      <div class="timer">{{ formattedTime }}</div>
      <button class="btn-done" @click="completeWorkout" :disabled="totalCompletedSets === 0">
        {{ $t('finish') }}
      </button>
    </header>

    <div class="stats-bar">
      <div class="stat"><span class="stat-val">{{ formattedTime }}</span><span class="stat-lbl">{{ $t('duration') }}</span></div>
      <div class="stat"><span class="stat-val">{{ totalVolume }}kg</span><span class="stat-lbl">{{ $t('volume') }}</span></div>
      <div class="stat"><span class="stat-val">{{ totalCompletedSets }}</span><span class="stat-lbl">{{ $t('sets') }}</span></div>
    </div>

    <div class="exercise-list">
      <div v-for="(ex, ei) in routine.exercises" :key="ei" class="exercise-card">
        <button class="ex-header" @click="ex.isExpanded = !ex.isExpanded">
          <div class="ex-info">
            <span class="ex-name">{{ ex.name }}</span>
            <span class="ex-stats">{{ completedSetsCount(ei) }}/{{ ex.sets.length }} sets</span>
          </div>
          <span class="chevron" :class="{ open: ex.isExpanded }">&#9660;</span>
        </button>

        <div v-if="ex.isExpanded" class="ex-body">
          <div class="set-header">
            <span class="set-col set-num">SET</span>
            <span class="set-col">{{ $t('weight') }}</span>
            <span class="set-col">{{ $t('reps') }}</span>
            <span class="set-col"></span>
          </div>

          <div v-for="(set, si) in ex.sets" :key="si" class="set-row">
            <span class="set-col set-num">{{ si + 1 }}</span>
            <input
              type="number"
              v-model="set.weight"
              class="set-input"
              placeholder="0"
              inputmode="decimal"
            />
            <input
              type="number"
              v-model="set.reps"
              class="set-input"
              placeholder="0"
            />
            <button
              class="set-check"
              :class="{ done: set.isCompleted }"
              @click="set.isCompleted = !set.isCompleted"
            >
              {{ set.isCompleted ? '✓' : '○' }}
            </button>
          </div>

          <button class="btn-add-set" @click="addSet(ei)">+ {{ $t('add_set') }}</button>
        </div>
      </div>
    </div>

    <div class="bottom-actions">
      <button class="btn-add-exercise" @click="goToAddExercise">
        + {{ $t('add_exercise') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkoutStore } from '@/stores/workoutStore'
import { AnalyticsService } from '@/services/analytics'

const route = useRoute()
const router = useRouter()
const workoutStore = useWorkoutStore()

interface Set { weight: string | number; reps: string; isCompleted: boolean }
interface TrackExercise { id: string | number; name: string; icon?: string; description?: string; restTime?: string; sets: Set[]; isExpanded?: boolean }

const routine = ref<{ id: string; routineName: string; exercises: TrackExercise[] }>({
  id: '',
  routineName: 'Workout',
  exercises: [],
})

const elapsed = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const state = history.state?.state?.routine
  if (state) {
    routine.value = {
      ...state,
      exercises: state.exercises.map((ex: any) => ({ ...ex, isExpanded: true })),
    }
  }
  timer = setInterval(() => { elapsed.value++ }, 1000)
  AnalyticsService.logWorkoutStarted('strength')
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const formattedTime = computed(() => {
  const h = Math.floor(elapsed.value / 3600)
  const m = Math.floor((elapsed.value % 3600) / 60)
  const s = elapsed.value % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const totalVolume = computed(() => {
  let vol = 0
  routine.value.exercises.forEach(ex => {
    ex.sets.filter(s => s.isCompleted).forEach(s => {
      vol += Number(s.weight || 0) * Number(s.reps || 0)
    })
  })
  return vol
})

const totalCompletedSets = computed(() => {
  let count = 0
  routine.value.exercises.forEach(ex => {
    count += ex.sets.filter(s => s.isCompleted).length
  })
  return count
})

function completedSetsCount(ei: number): number {
  return routine.value.exercises[ei].sets.filter(s => s.isCompleted).length
}

function addSet(ei: number) {
  routine.value.exercises[ei].sets.push({ weight: '', reps: '10', isCompleted: false })
}

function goToAddExercise() {
  router.push('/app/workout/create')
}

function completeWorkout() {
  const workout = {
    id: Date.now().toString(),
    routineName: routine.value.routineName,
    exercises: routine.value.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.map(s => ({
        weight: s.weight,
        reps: String(s.reps),
        isCompleted: s.isCompleted,
      })),
    })),
    duration: elapsed.value,
    volume: totalVolume.value,
    totalSets: totalCompletedSets.value,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  workoutStore.addWorkout(workout)

  router.push({
    name: 'WorkoutComplete',
    state: { workout },
  })
}

function confirmExit() {
  router.back()
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100dvh; color: white; background: #0f0f1a; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #0f0f1a; }
.btn-back, .btn-done { background: none; border: none; color: #6c63ff; font-size: 16px; cursor: pointer; }
.btn-done:disabled { color: #444; }
.timer { font-size: 18px; font-weight: 600; font-variant-numeric: tabular-nums; }
.stats-bar { display: flex; justify-content: space-around; padding: 12px 16px; background: #1a1a2e; margin: 0 12px; border-radius: 12px; margin-bottom: 12px; }
.stat { display: flex; flex-direction: column; align-items: center; }
.stat-val { font-size: 18px; font-weight: 700; color: #6c63ff; }
.stat-lbl { font-size: 11px; color: #666; margin-top: 2px; }
.exercise-list { flex: 1; overflow-y: auto; padding: 0 12px; }
.exercise-card { background: #1a1a2e; border-radius: 12px; margin-bottom: 10px; overflow: hidden; }
.ex-header { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 14px 16px; background: none; border: none; color: white; cursor: pointer; text-align: left; }
.ex-info { display: flex; flex-direction: column; }
.ex-name { font-size: 15px; font-weight: 500; }
.ex-stats { font-size: 12px; color: #888; margin-top: 2px; }
.chevron { font-size: 10px; color: #666; transition: transform 0.2s; }
.chevron.open { transform: rotate(180deg); }
.ex-body { padding: 0 16px 12px; }
.set-header { display: grid; grid-template-columns: 32px 1fr 1fr 36px; gap: 8px; margin-bottom: 8px; font-size: 11px; color: #666; padding: 0 4px; }
.set-row { display: grid; grid-template-columns: 32px 1fr 1fr 36px; gap: 8px; align-items: center; margin-bottom: 6px; }
.set-num { text-align: center; color: #888; font-size: 13px; font-weight: 600; }
.set-input { padding: 8px; border-radius: 8px; background: #0f0f1a; color: white; border: 1px solid #2a2a3e; font-size: 15px; text-align: center; width: 100%; }
.set-check { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #444; background: none; color: #444; font-size: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.set-check.done { border-color: #4caf50; background: #4caf5022; color: #4caf50; }
.btn-add-set { width: 100%; padding: 10px; border: 1px dashed #2a2a3e; border-radius: 8px; background: none; color: #888; font-size: 13px; cursor: pointer; margin-top: 6px; }
.bottom-actions { padding: 12px; padding-bottom: max(12px, env(safe-area-inset-bottom)); }
.btn-add-exercise { width: 100%; padding: 14px; border-radius: 12px; background: #1a1a2e; color: #6c63ff; border: 1px solid #6c63ff; font-size: 15px; cursor: pointer; }
</style>
