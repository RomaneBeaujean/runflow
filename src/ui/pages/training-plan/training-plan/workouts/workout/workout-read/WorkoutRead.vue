<template>
  <div class="flex flex-col gap-2">
    <div class="flex justify-between items-center">
      <div class="font-bold text-md">
        {{ workout.title }}
      </div>
      <ColorTag :label="sport.label" :color="sport.color" :icon="sport.icon" size="medium" />
    </div>

    <template v-if="workout.structure.type === 'basic'">
      <WorkoutReadBasic :workout="workout.structure" />
    </template>
    <template v-else>
      <WorkoutReadSteps :workout="workout.structure" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { Workout } from '@/domain/types/Workout';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import { useTrainingPlanHelper } from '@/ui/composables/useTrainingPlanHelper';
import WorkoutReadBasic from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-read/WorkoutReadBasic.vue';
import WorkoutReadSteps from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-read/WorkoutReadSteps.vue';
import { computed } from 'vue';
const { getSport } = useTrainingPlanHelper();

const sport = computed(() => {
  return getSport(props.workout.sportId);
})

interface Props {
  workout: Workout,
}

export interface TitleMessage {
  severity: string,
  message: string,
}

const props = defineProps<Props>();

</script>