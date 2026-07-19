<template>
  <div class="page">
    <h2>{{ $t('statistics') }}</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ userStats?.total_workouts || 0 }}</span>
        <span class="stat-label">{{ $t('total_workouts') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ userStats?.total_weight || 0 }}kg</span>
        <span class="stat-label">{{ $t('total_weight') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ Math.floor((userStats?.total_time || 0) / 60) }}h</span>
        <span class="stat-label">{{ $t('total_time') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ userStats?.current_streak || 0 }}</span>
        <span class="stat-label">{{ $t('streak') }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
const userStore = useUserStore()
const userStats = computed(() => userStore.userStats)
</script>
<style scoped>
.page { padding: 20px; color: white; }
h2 { font-size: 24px; margin-bottom: 20px; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stat-card { background: #1a1a2e; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; align-items: center; }
.stat-value { font-size: 28px; font-weight: 700; color: #6c63ff; }
.stat-label { font-size: 12px; color: #888; margin-top: 4px; }
</style>
