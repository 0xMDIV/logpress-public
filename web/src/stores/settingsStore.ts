import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { saveSettingToDB, getSettingFromDB } from '@/services/db'

type ThemeMode = 'light' | 'dark' | 'system'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<ThemeMode>('system')

  async function init() {
    const stored = await getSettingFromDB('logpress_theme')
    if (stored) {
      theme.value = stored as ThemeMode
    }
    applyTheme(theme.value)
  }

  watch(theme, (val) => {
    saveSettingToDB('logpress_theme', val)
    applyTheme(val)
  })

  function setTheme(mode: ThemeMode) {
    theme.value = mode
  }

  function applyTheme(mode: ThemeMode) {
    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }

  init()

  return { theme, setTheme, applyTheme }
})
