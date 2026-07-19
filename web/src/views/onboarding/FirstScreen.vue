<template>
  <div class="first-screen">
    <div class="content">
      <div class="logo-section">
        <h1 class="app-title">LogPress</h1>
        <p class="subtitle">{{ $t('welcome_subtitle') }}</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary" @click="startOnboarding">
          {{ $t('get_started') }}
        </button>
        <button class="btn btn-ghost" @click="signIn">
          {{ $t('i_have_an_account') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AnalyticsService } from '@/services/analytics'

const router = useRouter()

onMounted(() => {
  AnalyticsService.logScreenView('FirstScreen')
})

function startOnboarding() {
  AnalyticsService.logSignUp('onboarding')
  router.push('/onboarding/gender')
}

function signIn() {
  AnalyticsService.logLogin('existing')
  router.push('/app/home')
}
</script>

<style scoped>
.first-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100dvh;
  padding: 24px;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
}

.content {
  text-align: center;
  max-width: 320px;
}

.logo-section {
  margin-bottom: 48px;
}

.app-title {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #6c63ff, #e040fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 16px;
  color: #888;
  line-height: 1.5;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:active { opacity: 0.8; }

.btn-primary {
  background: linear-gradient(135deg, #6c63ff, #e040fb);
  color: white;
}

.btn-ghost {
  background: transparent;
  color: #6c63ff;
  border: 1px solid #6c63ff;
}
</style>
