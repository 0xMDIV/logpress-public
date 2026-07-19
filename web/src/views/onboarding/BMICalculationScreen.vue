<template>
  <div class="onboarding-screen">
    <div class="spinner"></div>
    <p>{{ $t('calculating_bmi') }}</p>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
onMounted(() => {
  setTimeout(() => router.push('/onboarding/bmi-results'), 2000)
})
</script>
<style scoped>
.onboarding-screen { min-height: 100dvh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #0f0f1a; color: white; gap: 24px; }
.spinner { width: 48px; height: 48px; border: 4px solid #2a2a3e; border-top-color: #6c63ff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
