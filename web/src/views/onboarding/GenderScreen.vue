<template>
  <div class="onboarding-screen">
    <h2>{{ $t('what_is_your_gender') }}</h2>
    <div class="options">
      <button v-for="g in genders" :key="g" class="option-btn" @click="select(g)">
        {{ g }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const genders = ['Male', 'Female', 'Other']
function select(g: string) {
  router.push('/onboarding/age')
}
</script>
<style scoped>
.onboarding-screen { padding: 24px; text-align: center; min-height: 100dvh; display: flex; flex-direction: column; justify-content: center; background: #0f0f1a; color: white; }
h2 { font-size: 24px; margin-bottom: 32px; }
.options { display: flex; flex-direction: column; gap: 12px; max-width: 300px; margin: 0 auto; }
.option-btn { padding: 16px; border-radius: 12px; background: #1a1a2e; color: white; border: 1px solid #2a2a3e; font-size: 16px; cursor: pointer; }
.option-btn:active { background: #2a2a3e; }
</style>
