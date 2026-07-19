<template>
  <div class="onboarding-screen">
    <h2>{{ $t('what_is_your_age') }}</h2>
    <input type="number" v-model="age" class="input" placeholder="18" />
    <button class="btn-primary" @click="next">Continue</button>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const age = ref(25)
function next() { router.push('/onboarding/height') }
</script>
<style scoped>
.onboarding-screen { padding: 24px; text-align: center; min-height: 100dvh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #0f0f1a; color: white; }
h2 { font-size: 24px; margin-bottom: 24px; }
.input { padding: 16px; border-radius: 12px; background: #1a1a2e; color: white; border: 1px solid #2a2a3e; font-size: 18px; width: 120px; text-align: center; margin-bottom: 24px; }
.btn-primary { padding: 16px 48px; border-radius: 12px; background: linear-gradient(135deg, #6c63ff, #e040fb); color: white; border: none; font-size: 16px; cursor: pointer; }
</style>
