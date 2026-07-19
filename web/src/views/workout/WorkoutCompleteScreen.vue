<template>
  <div class="page">
    <div class="celebration">
      <div class="trophy">&#x1F3C6;</div>
      <h2>{{ $t('workout_complete') }}!</h2>
      <p class="motivation">{{ $t('great_job') }}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-icon">&#x23F1;</span>
        <span class="stat-val">{{ formatDuration(workout.duration) }}</span>
        <span class="stat-lbl">{{ $t('duration') }}</span>
        <span class="stat-bonus">+{{ stats.endurance }} {{ $t('endurance') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">&#x1F4AA;</span>
        <span class="stat-val">{{ workout.volume }}kg</span>
        <span class="stat-lbl">{{ $t('volume') }}</span>
        <span class="stat-bonus">+{{ stats.strength }} {{ $t('strength') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">&#x1F504;</span>
        <span class="stat-val">{{ workout.totalSets }}</span>
        <span class="stat-lbl">{{ $t('sets') }}</span>
        <span class="stat-bonus">+{{ stats.power }} {{ $t('power') }}</span>
      </div>
    </div>

    <div class="score-section">
      <span class="score-label">{{ $t('workout_score') }}</span>
      <span class="score-value">{{ aiScore }}/100</span>
    </div>

    <div class="exercises-summary">
      <h3>{{ $t('exercises') }} ({{ workout.exercises?.length || 0 }})</h3>
      <div v-for="ex in workout.exercises" :key="ex.name" class="ex-row">
        <span>{{ ex.name }}</span>
        <span class="ex-sets">{{ ex.sets.filter((s: any) => s.isCompleted).length }} sets</span>
      </div>
    </div>

    <button class="btn-continue" @click="goHome">
      {{ $t('continue') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { WorkoutHistoryService } from '@/services/workoutHistoryService'
import { AnalyticsService } from '@/services/analytics'

const router = useRouter()
const userStore = useUserStore()

const workout = computed(() => {
  return (history.state?.state as any)?.workout || {
    duration: 0, volume: 0, totalSets: 0, exercises: [],
  }
})

const stats = computed(() => {
  const d = workout.value.duration || 0
  const v = workout.value.volume || 0
  const s = workout.value.totalSets || 0
  return {
    endurance: Math.max(1, Math.ceil((d / 60) * 0.5 + s * 0.3)),
    strength: Math.max(1, Math.ceil((v / 100) * 0.8)),
    power: Math.max(1, Math.ceil((v * s) / ((d / 60) || 1) * 0.1)),
  }
})

const aiScore = computed(() => WorkoutHistoryService.calculateAIScore(workout.value))

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}

onMounted(() => {
  AnalyticsService.logWorkoutCompleted('strength', workout.value.duration || 0)
})

function goHome() {
  router.push('/app/stats')
}
</script>

<style scoped>
.page { padding: 24px; color: white; min-height: 100dvh; background: #0f0f1a; display: flex; flex-direction: column; }
.celebration { text-align: center; margin-bottom: 28px; }
.trophy { font-size: 64px; margin-bottom: 12px; }
h2 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
.motivation { color: #888; font-size: 14px; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; }
.stat-card { background: #1a1a2e; border-radius: 14px; padding: 16px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-icon { font-size: 24px; }
.stat-val { font-size: 20px; font-weight: 700; color: #6c63ff; }
.stat-lbl { font-size: 11px; color: #888; }
.stat-bonus { font-size: 11px; color: #4caf50; }
.score-section { display: flex; justify-content: space-between; align-items: center; background: #1a1a2e; border-radius: 14px; padding: 16px; margin-bottom: 20px; }
.score-label { color: #888; font-size: 14px; }
.score-value { font-size: 24px; font-weight: 800; color: #6c63ff; }
.exercises-summary { flex: 1; margin-bottom: 20px; }
.exercises-summary h3 { font-size: 16px; margin-bottom: 12px; }
.ex-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1a1a2e; font-size: 14px; }
.ex-sets { color: #888; }
.btn-continue { padding: 16px; border-radius: 14px; background: linear-gradient(135deg, #6c63ff, #e040fb); color: white; border: none; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: auto; }
</style>
