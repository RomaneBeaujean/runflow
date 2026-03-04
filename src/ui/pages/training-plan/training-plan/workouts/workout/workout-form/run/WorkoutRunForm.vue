<template>
  <div :class="['p-2 mt-[-8px] rounded-md', basicSelected && 'bg-gray-100']">
    <div class="flex justify-center mb-2">
      <SwitchToggle label="Ajout simplifié" v-model:value="basicSelected" />
    </div>

    <WorkoutFormRunStructureSteps v-if="!basicSelected" v-model:workout="stepsStructure" />
    <WorkoutFormRunStructureBasic v-if="basicSelected" v-model:workout="basicStructure" />
  </div>
</template>

<script setup lang="ts">
import { createWorkoutStructure } from '@/domain/factories/RunWorkoutFactory';
import { RunWorkoutStructureBasic, RunWorkoutStructureWithSteps } from '@/domain/types/workout/RunWorkoutStructure';
import { Workout } from '@/domain/types/workout/Workout';
import SwitchToggle from '@/ui/components/inputs/SwitchToggle.vue';
import WorkoutFormRunStructureBasic from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-form/run/WorkoutFormRunStructureBasic.vue';
import WorkoutFormRunStructureSteps from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-form/run/WorkoutFormRunStructureSteps.vue';
import { ref, watch } from 'vue';

const props = defineProps<{
  workout: Workout;
}>();

const emit = defineEmits<{
  'update:workout': [Workout];
}>();

const getBasicStructure = (workout: Workout): RunWorkoutStructureBasic => {
  if (workout.structure.type === 'basic')
    return createWorkoutStructure(workout.structure) as RunWorkoutStructureBasic;
  return createWorkoutStructure({ type: 'basic' }) as RunWorkoutStructureBasic;
};

const getStepsStructure = (workout: Workout): RunWorkoutStructureWithSteps => {
  if (workout.structure.type === 'steps')
    return createWorkoutStructure(workout.structure) as RunWorkoutStructureWithSteps;
  return createWorkoutStructure({ type: 'steps' }) as RunWorkoutStructureWithSteps;
};

const internalWorkout = ref<Workout>(props.workout);
const basicSelected = ref<boolean>(
  internalWorkout.value.structure.type === 'basic'
);
const basicStructure = ref<RunWorkoutStructureBasic>(getBasicStructure(internalWorkout.value));
const stepsStructure = ref<RunWorkoutStructureWithSteps>(
  getStepsStructure(internalWorkout.value)
);

watch(
  () => props.workout,
  (newWorkout) => {
    if (!newWorkout) return;
    internalWorkout.value = newWorkout;
    basicSelected.value = newWorkout.structure.type === 'basic';
    basicStructure.value = getBasicStructure(newWorkout);
    stepsStructure.value = getStepsStructure(newWorkout);
  },
  { deep: true }
);

watch(basicSelected, () => {
  if (basicSelected.value) {
    internalWorkout.value.structure = createWorkoutStructure(
      basicStructure.value
    );
  } else {
    internalWorkout.value.structure = createWorkoutStructure(
      stepsStructure.value
    );
  }
  emit('update:workout', internalWorkout.value);
});

watch(
  basicStructure,
  () => {
    if (!basicSelected.value) return;
    internalWorkout.value.structure = basicStructure.value;
    emit('update:workout', internalWorkout.value);
  },
  { deep: true }
);

watch(
  stepsStructure,
  () => {
    if (basicSelected.value) return;
    internalWorkout.value.structure = stepsStructure.value;
    emit('update:workout', internalWorkout.value);
  },
  { deep: true }
);
</script>
