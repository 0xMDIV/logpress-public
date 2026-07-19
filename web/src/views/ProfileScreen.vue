<template>
  <div class="page">
    <div class="profile-header">
      <div class="avatar">{{ initials }}</div>
      <h2>{{ userStore.user?.display_name || $t('user') }}</h2>
      <p class="points">{{ userStore.user?.ls_score || 0 }} {{ $t('points') }}</p>
    </div>
    <div class="menu">
      <button class="menu-item" @click="$router.push('/app/profile/details')">{{ $t('profile_details') }}</button>
      <button class="menu-item" @click="$router.push('/app/points')">{{ $t('points') }}</button>
      <button class="menu-item" @click="$router.push('/app/badges')">{{ $t('badges') }}</button>
      <button class="menu-item" @click="$router.push('/app/leaderboard')">{{ $t('leaderboard') }}</button>
      <button class="menu-item" @click="$router.push('/app/settings')">{{ $t('settings') }}</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
const userStore = useUserStore()
const initials = computed(() => {
  const name = userStore.user?.display_name || 'U'
  return name.charAt(0).toUpperCase()
})
</script>
<style scoped>
.page { padding: 20px; color: white; }
.profile-header { text-align: center; margin-bottom: 32px; }
.avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #6c63ff, #e040fb); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; margin: 0 auto 12px; }
.points { color: #888; margin-top: 4px; }
.menu { display: flex; flex-direction: column; gap: 8px; }
.menu-item { padding: 16px; background: #1a1a2e; border: none; border-radius: 12px; color: white; text-align: left; font-size: 16px; cursor: pointer; }
.menu-item:active { background: #2a2a3e; }
</style>
