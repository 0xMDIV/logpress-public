import exercisesData from '@/data/exercises_fully_filled.json'

export interface ExerciseSet {
  id?: number
  weight: string | number
  reps: string
  isCompleted: boolean
}

export interface Exercise {
  id: string | number
  name: string
  target?: string
  equipment?: string
  muscle_group?: string[]
  image?: string
  bodyPart?: string
  gifUrl?: string
  instructions?: string[]
  sets?: ExerciseSet[]
  restTime?: string
  icon?: string
  description?: string
}

export interface ExerciseFilter {
  category?: string
  equipment?: string
  muscle_group?: string
  target?: string
  query?: string
}

const exercises: Exercise[] = (exercisesData as any[]).map((ex, i) => ({
  id: ex.id || i + 1,
  name: ex.name || '',
  target: ex.target || ex.bodyPart || '',
  equipment: ex.equipment || '',
  muscle_group: ex.muscle_group || ex.target ? [ex.target] : [],
  image: ex.image || ex.gifUrl || '',
  gifUrl: ex.gifUrl || '',
  instructions: ex.instructions || [],
  bodyPart: ex.bodyPart || '',
}))

export function getExercises(): Exercise[] {
  return exercises
}

export function searchExercises(query: string): Exercise[] {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return exercises.filter(ex =>
    ex.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
  )
}

export function getExerciseById(id: string | number): Exercise | undefined {
  return exercises.find(ex => ex.id === id)
}

export function getEquipmentTypes(): string[] {
  const equipmentSet = new Set<string>()
  exercises.forEach(ex => {
    if (ex.equipment) equipmentSet.add(ex.equipment)
  })
  return Array.from(equipmentSet).sort()
}

export function getTargetMuscles(): string[] {
  const muscleSet = new Set<string>()
  exercises.forEach(ex => {
    if (ex.target) muscleSet.add(ex.target)
    ex.muscle_group?.forEach(m => muscleSet.add(m))
  })
  return Array.from(muscleSet).sort()
}

export function filterExercises(filter: ExerciseFilter): Exercise[] {
  return exercises.filter(ex => {
    if (filter.query && !ex.name.toLowerCase().includes(filter.query.toLowerCase())) return false
    if (filter.equipment && ex.equipment !== filter.equipment) return false
    if (filter.muscle_group) {
      const muscleMatch = ex.muscle_group?.some(m =>
        m.toLowerCase().includes(filter.muscle_group!.toLowerCase())
      ) || ex.target?.toLowerCase().includes(filter.muscle_group.toLowerCase())
      if (!muscleMatch) return false
    }
    return true
  })
}
