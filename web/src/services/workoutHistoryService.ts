import { useWorkoutStore, type Workout } from '@/stores/workoutStore'

export interface WorkoutData {
  id: string
  routineName: string
  completedAt: string
  duration: number
  exercises: ExerciseData[]
  aiScore: number
  volume: number
  sets: number
  muscleGroups: string[]
  workoutType: string
  notes: string
}

export interface ExerciseData {
  id: number | string
  name: string
  sets: ExerciseSetData[]
  muscleGroup: string
  equipment: string
}

export interface ExerciseSetData {
  weight: number
  reps: number
  restTime: number
}

export interface CalendarCell {
  date: string
  intensity: number
  workoutCount: number
  aiScore: number
}

export class WorkoutHistoryService {
  static processWorkouts(rawWorkouts: Workout[]): WorkoutData[] {
    return rawWorkouts.map(w => ({
      id: w.id,
      routineName: w.routineName,
      completedAt: w.created_at,
      duration: this.calculateDuration(w),
      exercises: this.processExercises(w.exercises || []),
      aiScore: this.calculateAIScore(w),
      volume: this.calculateVolume(w),
      sets: this.countSets(w),
      muscleGroups: this.extractMuscleGroups(w.exercises || []),
      workoutType: 'strength',
      notes: '',
    }))
  }

  static processExercises(exercises: any[]): ExerciseData[] {
    return exercises.map(ex => ({
      id: ex.name,
      name: ex.name,
      sets: this.processSets(ex.sets || []),
      muscleGroup: this.guessMuscleGroup(ex.name),
      equipment: ex.equipment || '',
    }))
  }

  static guessMuscleGroup(exerciseName: string): string {
    const name = exerciseName.toLowerCase()
    if (/push|bench|press|chest|pec/i.test(name)) return 'chest'
    if (/pull|row|back|lateral/i.test(name)) return 'back'
    if (/squat|leg|quad|lung/i.test(name)) return 'quadriceps'
    if (/curl|bicep/i.test(name)) return 'biceps'
    if (/tricep|pushdown|skull/i.test(name)) return 'triceps'
    if (/shoulder|ohp|military|lateral|front raise/i.test(name)) return 'shoulders'
    if (/deadlift|hamstring|rdl|leg curl/i.test(name)) return 'hamstrings'
    if (/calf|raise/i.test(name)) return 'calves'
    if (/glute|hip|bridge/i.test(name)) return 'glutes'
    if (/abs|crunch|plank|leg raise|hanging/i.test(name)) return 'abdominals'
    return 'full body'
  }

  static processSets(rawSets: any[]): ExerciseSetData[] {
    return rawSets
      .filter(s => s.isCompleted)
      .map(s => ({
        weight: Number(s.weight) || 0,
        reps: Number(s.reps) || 0,
        restTime: 90,
      }))
  }

  static generateCalendarData(workouts: WorkoutData[], month: string): CalendarCell[] {
    const cells: CalendarCell[] = []
    const daysInMonth = new Date(month + '-01').getMonth() === 11
      ? 31 : new Date(new Date(month + '-01').getFullYear(), new Date(month + '-01').getMonth() + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${month}-${String(day).padStart(2, '0')}`
      const dayWorkouts = workouts.filter(w => w.completedAt.startsWith(dateStr))
      const avgScore = dayWorkouts.length > 0
        ? dayWorkouts.reduce((sum, w) => sum + w.aiScore, 0) / dayWorkouts.length
        : 0
      const intensity = avgScore > 80 ? 4 : avgScore > 60 ? 3 : avgScore > 40 ? 2 : avgScore > 0 ? 1 : 0

      cells.push({
        date: dateStr,
        intensity,
        workoutCount: dayWorkouts.length,
        aiScore: avgScore,
      })
    }
    return cells
  }

  static calculateAIScore(workout: any): number {
    const volume = this.calculateVolume(workout)
    const duration = this.calculateDuration(workout)
    const sets = this.countSets(workout)

    if (duration === 0) return 0
    const efficiency = volume / duration
    let score = Math.min(70, Math.ceil(efficiency * 10))
    score += Math.min(20, sets * 3)
    if (duration >= 1800 && duration <= 5400) score += 10
    return Math.min(100, score)
  }

  static calculateVolume(workout: any): number {
    let total = 0
    ;(workout.exercises || []).forEach((ex: any) => {
      ;(ex.sets || []).forEach((set: any) => {
        total += Number(set.weight || 0) * Number(set.reps || 0)
      })
    })
    return total
  }

  static calculateDuration(workout: any): number {
    if (workout.duration) return workout.duration
    const sets = this.countSets(workout)
    return sets * 90
  }

  static countSets(workout: any): number {
    let count = 0
    ;(workout.exercises || []).forEach((ex: any) => {
      count += (ex.sets || []).filter((s: any) => s.isCompleted).length
    })
    return count
  }

  static extractMuscleGroups(exercises: any[]): string[] {
    const groups = new Set<string>()
    exercises.forEach((ex: any) => {
      groups.add(this.guessMuscleGroup(ex.name || ''))
    })
    return Array.from(groups)
  }
}
