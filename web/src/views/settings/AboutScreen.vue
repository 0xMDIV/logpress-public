<template>
  <div class="page">
    <button class="back" @click="$router.back()">&larr; {{ $t('back') }}</button>
    <h2>{{ $t('about') }}</h2>
    <p>LogPress v0.1.0</p>
    <p class="desc">AI-powered fitness tracking PWA</p>
  </div>
</template>
<style scoped>
.page { padding: 20px; color: white; }
.back { background: none; border: none; color: #6c63ff; font-size: 16px; cursor: pointer; margin-bottom: 20px; }
h2 { font-size: 24px; margin-bottom: 12px; }
.desc { color: #666; margin-top: 8px; }
</style>
