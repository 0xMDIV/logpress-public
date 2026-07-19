<template>
  <div class="home-screen">
    <header class="header">
      <div class="greeting">
        <h1>{{ $t('hello') }}, {{ userStore.user?.display_name || $t('athlete') }}</h1>
        <p class="subtitle">{{ $t('lets_workout') }}</p>
      </div>
    </header>

    <div class="stats-row">
      <div class="mini-card">
        <span class="mini-val">{{ userStore.user?.ls_score || 0 }}</span>
        <span class="mini-lbl">{{ $t('points') }}</span>
      </div>
      <div class="mini-card">
        <span class="mini-val">{{ userStore.userStats?.current_streak || 0 }}</span>
        <span class="mini-lbl">{{ $t('streak') }}</span>
      </div>
      <div class="mini-card">
        <span class="mini-val">{{ workoutStore.workoutCount }}</span>
        <span class="mini-lbl">{{ $t('workouts') }}</span>
      </div>
    </div>

    <div class="section">
      <h2>{{ $t('this_week') }}</h2>
      <div class="weekly-chart">
        <div v-for="(day, i) in weekDays" :key="i" class="bar-col">
          <div class="bar-wrapper">
            <div
              class="bar"
              :style="{ height: barHeight(day.minutes) + '%' }"
            ></div>
          </div>
          <span class="bar-label">{{ day.label }}</span>
          <span class="bar-value">{{ day.minutes > 0 ? Math.round(day.minutes) + 'm' : '' }}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>{{ $t('quick_start') }}</h2>
      <div class="quick-actions">
        <button class="quick-btn" @click="$router.push('/app/workout/create')">
          <span class="quick-icon">+</span>
          <span>{{ $t('new_workout') }}</span>
        </button>
        <button class="quick-btn" @click="$router.push('/app/workout')">
          <span class="quick-icon">&#x1F4CB;</span>
          <span>{{ $t('my_routines') }}</span>
        </button>
        <button class="quick-btn" @click="$router.push('/app/workout/ready-routines')">
          <span class="quick-icon">&#x1F4A1;</span>
          <span>{{ $t('discover') }}</span>
        </button>
      </div>
    </div>

    <div class="section" v-if="workoutStore.lastWorkout">
      <h2>{{ $t('last_workout') }}</h2>
      <div class="last-workout-card" @click="$router.push('/app/home')">
        <div>
          <span class="lw-name">{{ workoutStore.lastWorkout?.routineName }}</span>
          <span class="lw-date">{{ formatDate(workoutStore.lastWorkout?.created_at) }}</span>
        </div>
        <span class="lw-arrow">&rarr;</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useWorkoutStore } from '@/stores/workoutStore'
import { WorkoutHistoryService } from '@/services/workoutHistoryService'

const userStore = useUserStore()
const workoutStore = useWorkoutStore()

onMounted(() => {
  userStore.loadFromStorage()
  workoutStore.loadFromStorage()
})

const today = new Date()
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const weekDays = computed(() => {
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))

  const processed = WorkoutHistoryService.processWorkouts(workoutStore.workouts)

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const dayWorkouts = processed.filter(w => w.completedAt.startsWith(dateStr))
    const totalMinutes = dayWorkouts.reduce((sum, w) => sum + Math.round(w.duration / 60), 0)

    return {
      label: dayNames[i],
      date: dateStr,
      minutes: totalMinutes,
    }
  })
})

const maxMinutes = computed(() => Math.max(...weekDays.value.map(d => d.minutes), 1))

function barHeight(minutes: number): number {
  return (minutes / maxMinutes.value) * 100
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}
</script>

<style scoped>
.home-screen { padding: 20px 16px; color: white; padding-bottom: 80px; }
.header { margin-bottom: 20px; }
.header h1 { font-size: 24px; font-weight: 700; }
.subtitle { color: #888; margin-top: 4px; font-size: 14px; }
.stats-row { display: flex; gap: 10px; margin-bottom: 24px; }
.mini-card { flex: 1; background: #1a1a2e; border-radius: 12px; padding: 14px; text-align: center; }
.mini-val { display: block; font-size: 22px; font-weight: 700; color: #6c63ff; }
.mini-lbl { font-size: 11px; color: #888; margin-top: 2px; }
.section { margin-bottom: 24px; }
.section h2 { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.weekly-chart { display: flex; justify-content: space-between; align-items: flex-end; height: 140px; background: #1a1a2e; border-radius: 14px; padding: 16px 12px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.bar-wrapper { width: 100%; max-width: 28px; height: 80px; display: flex; flex-direction: column; justify-content: flex-end; }
.bar { width: 100%; background: linear-gradient(to top, #6c63ff, #e040fb); border-radius: 6px 6px 2px 2px; min-height: 4px; transition: height 0.3s; }
.bar-label { font-size: 10px; color: #888; margin-top: 6px; }
.bar-value { font-size: 9px; color: #666; margin-top: 2px; }
.quick-actions { display: flex; gap: 10px; }
.quick-btn { flex: 1; padding: 16px 10px; border-radius: 14px; background: #1a1a2e; border: 1px solid #2a2a3e; color: white; cursor: pointer; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 12px; }
.quick-icon { font-size: 22px; }
.last-workout-card { display: flex; justify-content: space-between; align-items: center; background: #1a1a2e; border-radius: 12px; padding: 14px; cursor: pointer; }
.lw-name { display: block; font-size: 14px; font-weight: 500; }
.lw-date { display: block; font-size: 12px; color: #888; margin-top: 4px; }
.lw-arrow { color: #6c63ff; font-size: 20px; }
</style>
