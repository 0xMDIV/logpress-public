<template>
  <div class="page">
    <header class="header">
      <button class="btn-back" @click="$router.back()">&larr;</button>
      <h2>{{ $t('create_workout') }}</h2>
      <button class="btn-done" @click="saveRoutine" :disabled="selectedExercises.length === 0">
        {{ $t('done') }} ({{ selectedExercises.length }})
      </button>
    </header>

    <div class="search-bar">
      <input
        v-model="searchQuery"
        :placeholder="$t('search_exercises')"
        class="search-input"
        @input="handleSearch"
      />
    </div>

    <div class="filter-tabs">
      <button
        v-for="f in filters"
        :key="f.key"
        class="filter-chip"
        :class="{ active: activeFilter === f.key }"
        @click="activeFilter = f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <div v-if="showFilterOptions" class="filter-options">
      <button
        v-for="opt in filterOptions"
        :key="opt"
        class="filter-option"
        :class="{ active: selectedFilterValue === opt }"
        @click="selectFilter(opt)"
      >
        {{ opt }}
      </button>
    </div>

    <div class="exercise-list">
      <button
        v-for="ex in filteredExercises"
        :key="ex.id"
        class="exercise-item"
        :class="{ selected: isSelected(ex) }"
        @click="toggleExercise(ex)"
      >
        <div class="ex-info">
          <span class="ex-name">{{ ex.name }}</span>
          <span class="ex-target">{{ ex.target || ex.bodyPart }}</span>
        </div>
        <div class="ex-check" v-if="isSelected(ex)">&#10003;</div>
      </button>
      <div v-if="filteredExercises.length === 0" class="empty">
        {{ $t('no_exercises_found') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { searchExercises, filterExercises, getEquipmentTypes, getTargetMuscles, type Exercise } from '@/services/exerciseService'

const router = useRouter()
const searchQuery = ref('')
const selectedExercises = ref<Exercise[]>([])
const activeFilter = ref<'all' | 'equipment' | 'muscle'>('all')
const selectedFilterValue = ref('')

type FilterKey = 'all' | 'equipment' | 'muscle'
const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'muscle', label: 'Muscle' },
]

const filterOptions = computed(() => {
  if (activeFilter.value === 'equipment') return getEquipmentTypes()
  if (activeFilter.value === 'muscle') return getTargetMuscles()
  return []
})

const showFilterOptions = computed(() => activeFilter.value !== 'all')

const filteredExercises = computed(() => {
  if (activeFilter.value === 'all' && !searchQuery.value) {
    return searchExercises('')
  }
  if (searchQuery.value) {
    return searchExercises(searchQuery.value)
  }
  return filterExercises({
    [activeFilter.value === 'equipment' ? 'equipment' : 'muscle_group']: selectedFilterValue.value,
  })
})

function handleSearch() {}

function isSelected(ex: Exercise): boolean {
  return selectedExercises.value.some(s => s.id === ex.id)
}

function toggleExercise(ex: Exercise) {
  const idx = selectedExercises.value.findIndex(s => s.id === ex.id)
  if (idx >= 0) {
    selectedExercises.value.splice(idx, 1)
  } else {
    selectedExercises.value.push({ ...ex, sets: [{ weight: '', reps: '10', isCompleted: false }] })
  }
}

function selectFilter(value: string) {
  selectedFilterValue.value = value
}

function saveRoutine() {
  const id = Date.now().toString()
  const routine = {
    id,
    routineName: 'Custom Routine',
    exercises: selectedExercises.value.map(ex => ({
      id: ex.id,
      name: ex.name,
      icon: ex.icon,
      description: ex.description || ex.instructions?.[0],
      restTime: '90',
      sets: [{ weight: '', reps: '10', isCompleted: false }],
    })),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  router.push({
    name: 'WorkoutTracking',
    params: { id },
    state: { routine },
  })
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100dvh; color: white; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #0f0f1a; }
.header h2 { font-size: 18px; }
.btn-back, .btn-done { background: none; border: none; color: #6c63ff; font-size: 16px; cursor: pointer; }
.btn-done:disabled { color: #444; }
.search-bar { padding: 0 16px 12px; }
.search-input { width: 100%; padding: 12px 16px; border-radius: 12px; background: #1a1a2e; color: white; border: 1px solid #2a2a3e; font-size: 16px; }
.filter-tabs { display: flex; gap: 8px; padding: 0 16px 12px; }
.filter-chip { padding: 6px 14px; border-radius: 20px; background: #1a1a2e; color: #888; border: 1px solid #2a2a3e; font-size: 13px; cursor: pointer; white-space: nowrap; }
.filter-chip.active { background: #6c63ff; color: white; border-color: #6c63ff; }
.filter-options { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 12px; }
.filter-option { padding: 6px 12px; border-radius: 16px; background: #1a1a2e; color: #888; border: 1px solid #2a2a3e; font-size: 12px; cursor: pointer; }
.filter-option.active { background: #6c63ff44; color: #6c63ff; border-color: #6c63ff; }
.exercise-list { flex: 1; overflow-y: auto; padding: 0 16px 80px; }
.exercise-item { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px; background: #1a1a2e; border: 1px solid #2a2a3e; border-radius: 10px; margin-bottom: 8px; text-align: left; cursor: pointer; }
.exercise-item.selected { border-color: #6c63ff; background: #6c63ff11; }
.ex-info { display: flex; flex-direction: column; }
.ex-name { font-size: 15px; color: white; }
.ex-target { font-size: 12px; color: #666; margin-top: 2px; }
.ex-check { color: #6c63ff; font-size: 18px; }
.empty { text-align: center; padding: 48px; color: #666; }
</style>
