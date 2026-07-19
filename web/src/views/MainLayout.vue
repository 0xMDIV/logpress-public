<template>
  <div class="app-layout">
    <div v-if="isOffline" class="offline-banner">
      {{ $t('offline_mode') }}
    </div>
    <main class="app-content">
      <RouterView />
    </main>
    <nav class="bottom-tab-bar">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="tab-item"
        :class="{ active: $route.path.startsWith(tab.path) }"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        <span class="tab-label">{{ $t(tab.labelKey) }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useOnlineStatus } from '@/services/offline'

const route = useRoute()
const { isOffline } = useOnlineStatus()

const tabs = [
  { path: '/app/home', labelKey: 'home', icon: '&#x1F3E0;' },
  { path: '/app/workout', labelKey: 'workout', icon: '&#x1F4AA;' },
  { path: '/app/stats', labelKey: 'statistics', icon: '&#x1F4CA;' },
  { path: '/app/profile', labelKey: 'profile', icon: '&#x1F464;' },
]
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: var(--bg, #0f0f1a);
  color: var(--text, #ffffff);
}

.offline-banner {
  background: #ff9800;
  color: #000;
  text-align: center;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 0;
}

.bottom-tab-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--surface, #1a1a2e);
  border-top: 1px solid var(--border, #2a2a3e);
  padding: 8px 0;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: var(--text-secondary, #666);
  font-size: 10px;
  transition: color 0.2s;
}

.tab-item.active {
  color: var(--primary, #6c63ff);
}

.tab-icon {
  font-size: 22px;
  line-height: 1;
}

.tab-label {
  font-size: 10px;
}
</style>
