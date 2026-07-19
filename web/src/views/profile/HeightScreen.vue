<template>
  <div class="page">
    <button class="back" @click="$router.back()">&larr; {{ $t('back') }}</button>
    <h2>{{ $t('height') }}</h2>
    <input type="number" v-model="height" class="input" /><span class="unit">cm</span>
    <button class="btn-primary" @click="save">{{ $t('save') }}</button>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'; import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
const router = useRouter(); const userStore = useUserStore()
const height = ref(userStore.user?.height || 175)
function save() { userStore.updateUser({ height: height.value }); router.back() }
</script>
<style scoped>
.page { padding: 20px; color: white; }
.back { background: none; border: none; color: #6c63ff; font-size: 16px; cursor: pointer; margin-bottom: 20px; }
h2 { font-size: 24px; margin-bottom: 20px; }
.input { padding: 12px; border-radius: 8px; background: #1a1a2e; color: white; border: 1px solid #2a2a3e; font-size: 18px; width: 100px; text-align: center; margin-right: 8px; }
.unit { color: #888; }
.btn-primary { display: block; margin-top: 20px; padding: 12px 24px; border-radius: 12px; background: linear-gradient(135deg, #6c63ff, #e040fb); color: white; border: none; font-size: 16px; cursor: pointer; }
</style>
