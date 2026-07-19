<template>
  <div class="page">
    <button class="back" @click="$router.back()">&larr; {{ $t('back') }}</button>
    <h2>{{ $t('language') }}</h2>
    <div class="options">
      <button v-for="lang in languages" :key="lang.code" class="option-btn" @click="setLang(lang.code)">
        {{ lang.name }}
        <span v-if="lang.code === currentLang" class="check">&#10003;</span>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
const languages = [
  { code: 'tr', name: 'Türkçe' }, { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' }, { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' }, { code: 'ru', name: 'Русский' },
]
const currentLang = 'tr'
function setLang(code: string) {}
</script>
<style scoped>
.page { padding: 20px; color: white; }
.back { background: none; border: none; color: #6c63ff; font-size: 16px; cursor: pointer; margin-bottom: 20px; }
h2 { font-size: 24px; margin-bottom: 20px; }
.options { display: flex; flex-direction: column; gap: 8px; }
.option-btn { display: flex; justify-content: space-between; padding: 16px; background: #1a1a2e; border: none; border-radius: 12px; color: white; font-size: 16px; cursor: pointer; }
.check { color: #6c63ff; }
</style>
