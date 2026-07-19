<template>
  <div class="page">
    <button class="back" @click="$router.back()">&larr; {{ $t('back') }}</button>
    <h2>{{ $t('frequency') }}</h2>
    <div class="options">
      <button v-for="f in freqs" :key="f" class="option-btn" @click="select(f)">{{ f }}</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
const router = useRouter(); const userStore = useUserStore()
const freqs = ['2-3 days/week', '3-4 days/week', '5-6 days/week']
function select(f: string) { userStore.updateUser({ exercise_hours: f }); router.back() }
</script>
<style scoped>
.page { padding: 20px; color: white; }
.back { background: none; border: none; color: #6c63ff; font-size: 16px; cursor: pointer; margin-bottom: 20px; }
h2 { font-size: 24px; margin-bottom: 20px; }
.options { display: flex; flex-direction: column; gap: 8px; }
.option-btn { padding: 16px; background: #1a1a2e; border: none; border-radius: 12px; color: white; font-size: 16px; cursor: pointer; }
</style>
