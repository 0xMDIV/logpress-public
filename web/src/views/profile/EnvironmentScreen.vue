<template>
  <div class="page">
    <button class="back" @click="$router.back()">&larr; {{ $t('back') }}</button>
    <h2>{{ $t('environment') }}</h2>
    <div class="options">
      <button v-for="e in envs" :key="e" class="option-btn" @click="select(e)">{{ e }}</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
const router = useRouter(); const userStore = useUserStore()
const envs = ['Home', 'Gym', 'Outdoor']
function select(e: string) { userStore.updateUser({ environment_preference: e }); router.back() }
</script>
<style scoped>
.page { padding: 20px; color: white; }
.back { background: none; border: none; color: #6c63ff; font-size: 16px; cursor: pointer; margin-bottom: 20px; }
h2 { font-size: 24px; margin-bottom: 20px; }
.options { display: flex; flex-direction: column; gap: 8px; }
.option-btn { padding: 16px; background: #1a1a2e; border: none; border-radius: 12px; color: white; font-size: 16px; cursor: pointer; }
</style>
