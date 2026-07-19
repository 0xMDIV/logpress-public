import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/onboarding',
    },
    {
      path: '/onboarding',
      name: 'Onboarding',
      redirect: '/onboarding/first',
      children: [
        {
          path: 'first',
          name: 'FirstScreen',
          component: () => import('@/views/onboarding/FirstScreen.vue'),
        },
        {
          path: 'gender',
          name: 'Gender',
          component: () => import('@/views/onboarding/GenderScreen.vue'),
        },
        {
          path: 'age',
          name: 'Age',
          component: () => import('@/views/onboarding/AgeScreen.vue'),
        },
        {
          path: 'height',
          name: 'Height',
          component: () => import('@/views/onboarding/HeightScreen.vue'),
        },
        {
          path: 'weight',
          name: 'Weight',
          component: () => import('@/views/onboarding/WeightScreen.vue'),
        },
        {
          path: 'goal',
          name: 'Goal',
          component: () => import('@/views/onboarding/GoalScreen.vue'),
        },
        {
          path: 'frequency',
          name: 'Frequency',
          component: () => import('@/views/onboarding/FrequencyScreen.vue'),
        },
        {
          path: 'environment',
          name: 'Environment',
          component: () => import('@/views/onboarding/EnvironmentScreen.vue'),
        },
        {
          path: 'experience',
          name: 'Experience',
          component: () => import('@/views/onboarding/ExperienceScreen.vue'),
        },
        {
          path: 'bmi-calculation',
          name: 'BMICalculation',
          component: () => import('@/views/onboarding/BMICalculationScreen.vue'),
        },
        {
          path: 'bmi-results',
          name: 'BMIResults',
          component: () => import('@/views/onboarding/BMIResultsScreen.vue'),
        },
      ],
    },
    {
      path: '/app',
      component: () => import('@/views/MainLayout.vue'),
      children: [
        {
          path: 'home',
          name: 'Home',
          component: () => import('@/views/HomeScreen.vue'),
        },
        {
          path: 'workout',
          name: 'Workout',
          component: () => import('@/views/workout/WorkoutScreen.vue'),
        },
        {
          path: 'workout/ready-routines',
          name: 'ReadyRoutines',
          component: () => import('@/views/workout/ReadyRoutinesScreen.vue'),
        },
        {
          path: 'workout/create',
          name: 'CreateWorkout',
          component: () => import('@/views/workout/CreateWorkoutScreen.vue'),
        },
        {
          path: 'workout/tracking/:id',
          name: 'WorkoutTracking',
          component: () => import('@/views/workout/WorkoutTrackingScreen.vue'),
        },
        {
          path: 'workout/complete',
          name: 'WorkoutComplete',
          component: () => import('@/views/workout/WorkoutCompleteScreen.vue'),
        },
        {
          path: 'stats',
          name: 'Stats',
          component: () => import('@/views/StatsScreen.vue'),
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/ProfileScreen.vue'),
        },
        {
          path: 'profile/details',
          name: 'ProfileDetails',
          component: () => import('@/views/ProfileDetailsScreen.vue'),
        },
        {
          path: 'profile/edit',
          children: [
            { path: 'bio', name: 'Bio', component: () => import('@/views/profile/BioScreen.vue') },
            { path: 'weight', name: 'EditWeight', component: () => import('@/views/profile/WeightScreen.vue') },
            { path: 'height', name: 'EditHeight', component: () => import('@/views/profile/HeightScreen.vue') },
            { path: 'goal', name: 'EditGoal', component: () => import('@/views/profile/GoalScreen.vue') },
            { path: 'frequency', name: 'EditFrequency', component: () => import('@/views/profile/FrequencyScreen.vue') },
            { path: 'environment', name: 'EditEnvironment', component: () => import('@/views/profile/EnvironmentScreen.vue') },
          ],
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/SettingsScreen.vue'),
        },
        {
          path: 'settings/language',
          name: 'LanguageSettings',
          component: () => import('@/views/settings/LanguageSettingsScreen.vue'),
        },
        {
          path: 'settings/theme',
          name: 'ThemeSettings',
          component: () => import('@/views/settings/ThemeScreen.vue'),
        },
        {
          path: 'settings/privacy',
          name: 'PrivacySettings',
          component: () => import('@/views/settings/PrivacySettingsScreen.vue'),
        },
        {
          path: 'settings/about',
          name: 'About',
          component: () => import('@/views/settings/AboutScreen.vue'),
        },
        {
          path: 'points',
          name: 'Points',
          component: () => import('@/views/PointsScreen.vue'),
        },
        {
          path: 'badges',
          name: 'Badges',
          component: () => import('@/views/BadgesScreen.vue'),
        },
        {
          path: 'leaderboard',
          name: 'Leaderboard',
          component: () => import('@/views/LeaderboardScreen.vue'),
        },
        {
          path: 'leaderboard/:userId',
          name: 'LeaderboardProfile',
          component: () => import('@/views/LeaderboardProfileScreen.vue'),
        },
      ],
    },
  ],
})

export default router
