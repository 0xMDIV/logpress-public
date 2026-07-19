<template>
  <div class="page">
    <button class="back" @click="$router.back()">&larr; {{ $t('back') }}</button>
    <h2>{{ $t('theme') }}</h2>
    <div class="options">
      <button v-for="t in themes" :key="t.value" class="option-btn" @click="setTheme(t.value)">
        {{ t.label }}
        <span v-if="settingsStore.theme === t.value" class="check">&#10003;</span>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore'
import { AnalyticsService } from '@/services/analytics'

const settingsStore = useSettingsStore()
const themes = [
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
  { value: 'system' as const, label: 'System' },
]

function setTheme(val: 'light' | 'dark' | 'system') {
  settingsStore.setTheme(val)
  AnalyticsService.logSettingsChanged('theme', val)
}
</script>
<style scoped>
.page { padding: 20px; color: white; }
.back { background: none; border: none; color: #6c63ff; font-size: 16px; cursor: pointer; margin-bottom: 20px; }
h2 { font-size: 24px; margin-bottom: 20px; }
.options { display: flex; flex-direction: column; gap: 8px; }
.option-btn { display: flex; justify-content: space-between; padding: 16px; background: #1a1a2e; border: none; border-radius: 12px; color: white; font-size: 16px; cursor: pointer; }
.check { color: #6c63ff; }
</style>
