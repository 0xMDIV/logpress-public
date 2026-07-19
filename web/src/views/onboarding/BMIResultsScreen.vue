<template>
  <div class="onboarding-screen">
    <h2>{{ $t('your_bmi') }}</h2>
    <div class="bmi-value">22.5</div>
    <p class="bmi-category">Normal</p>
    <button class="btn-primary" @click="finish">{{ $t('continue') }}</button>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
const router = useRouter()
const store = useUserStore()
function finish() {
  store.addUser({
    id: crypto.randomUUID(),
    display_name: 'User',
    gender: '', age: 0, weight: 0, height: 0,
    aim: '', experience: '', exercise_hours: '',
    profile_percentage: 63, ls_score: 0, user_role_id: 1,
    skill_level: '', leaderboard_points: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  router.push('/app/home')
}
</script>
<style scoped>
.onboarding-screen { padding: 24px; text-align: center; min-height: 100dvh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #0f0f1a; color: white; }
h2 { font-size: 24px; margin-bottom: 16px; }
.bmi-value { font-size: 64px; font-weight: 800; color: #6c63ff; }
.bmi-category { font-size: 18px; color: #888; margin-bottom: 48px; }
.btn-primary { padding: 16px 48px; border-radius: 12px; background: linear-gradient(135deg, #6c63ff, #e040fb); color: white; border: none; font-size: 16px; cursor: pointer; }
</style>
