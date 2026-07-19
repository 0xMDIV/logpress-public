<template>
  <div class="page">
    <button class="back" @click="$router.back()">&larr; {{ $t('back') }}</button>
    <h2>{{ $t('points') }}</h2>
    <div class="score-display">
      <span class="score-value">{{ userStore.user?.ls_score || 0 }}</span>
      <span class="score-label">{{ $t('total_points') }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
const userStore = useUserStore()
</script>
<style scoped>
.page { padding: 20px; color: white; text-align: center; }
.back { background: none; border: none; color: #6c63ff; font-size: 16px; cursor: pointer; margin-bottom: 20px; text-align: left; display: block; width: 100%; }
h2 { font-size: 24px; margin-bottom: 32px; }
.score-display { display: flex; flex-direction: column; align-items: center; }
.score-value { font-size: 64px; font-weight: 800; color: #6c63ff; }
.score-label { color: #888; margin-top: 8px; }
</style>
