<template>
  <div class="page">
    <button class="back" @click="$router.back()">&larr; {{ $t('back') }}</button>
    <h2>{{ $t('settings') }}</h2>
    <div class="menu">
      <button class="menu-item" @click="$router.push('/app/settings/language')">{{ $t('language') }}</button>
      <button class="menu-item" @click="$router.push('/app/settings/theme')">{{ $t('theme') }}</button>
      <button class="menu-item" @click="$router.push('/app/settings/privacy')">{{ $t('privacy') }}</button>
      <button class="menu-item" @click="$router.push('/app/settings/about')">{{ $t('about') }}</button>
    </div>
  </div>
</template>
<style scoped>
.page { padding: 20px; color: white; }
.back { background: none; border: none; color: #6c63ff; font-size: 16px; cursor: pointer; margin-bottom: 20px; }
h2 { font-size: 24px; margin-bottom: 20px; }
.menu { display: flex; flex-direction: column; gap: 8px; }
.menu-item { padding: 16px; background: #1a1a2e; border: none; border-radius: 12px; color: white; text-align: left; font-size: 16px; cursor: pointer; }
.menu-item:active { background: #2a2a3e; }
</style>
