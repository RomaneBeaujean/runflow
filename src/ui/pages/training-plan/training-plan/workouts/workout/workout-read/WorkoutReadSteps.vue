<template>
  <div class="flex flex-col gap-2">
    <template v-for="step in workout.steps">
      <WorkoutReadStepWork v-if="step.type === 'work'" :step="step" />
      <WorkoutReadStepRecovery v-if="step.type === 'recovery'" :step="step" />
      <WorkoutReadStepWarmup v-if="step.type === 'warmup'" :step="step" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { WorkoutWithSteps } from '@/domain/types/workout/Workout';
import WorkoutReadStepRecovery from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-read/WorkoutReadStepRecovery.vue';
import WorkoutReadStepWarmup from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-read/WorkoutReadStepWarmup.vue';
import WorkoutReadStepWork from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-read/WorkoutReadStepWork.vue';

const props = defineProps<{
  workout: WorkoutWithSteps
}>();
</script>