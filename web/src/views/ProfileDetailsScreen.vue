<template>
  <div class="page">
    <button class="back" @click="$router.back()">&larr; {{ $t('back') }}</button>
    <h2>{{ $t('profile_details') }}</h2>
    <div class="info-grid">
      <div class="info-row"><span>{{ $t('name') }}</span><span>{{ userStore.user?.display_name }}</span></div>
      <div class="info-row"><span>{{ $t('age') }}</span><span>{{ userStore.user?.age }}</span></div>
      <div class="info-row"><span>{{ $t('weight') }}</span><span>{{ userStore.user?.weight }} kg</span></div>
      <div class="info-row"><span>{{ $t('height') }}</span><span>{{ userStore.user?.height }} cm</span></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
const userStore = useUserStore()
</script>
<style scoped>
.page { padding: 20px; color: white; }
.back { background: none; border: none; color: #6c63ff; font-size: 16px; cursor: pointer; margin-bottom: 20px; }
h2 { font-size: 24px; margin-bottom: 20px; }
.info-grid { display: flex; flex-direction: column; gap: 8px; }
.info-row { display: flex; justify-content: space-between; padding: 12px; background: #1a1a2e; border-radius: 8px; }
.info-row span:first-child { color: #888; }
</style>
