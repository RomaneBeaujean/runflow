<template>
  <div v-if="!hasWarmup" class="flex justify-center p-2">
    <Button size="small" outlined icon="pi pi-plus" label="Echauffement" @click="handleAddWarmup" />
  </div>

  <draggable v-model="internalSteps" :group="{ name: 'steps', pull: true, put: true }" item-key="id"
    handle=".drag-handle" animation="200" class="flex flex-col gap-5">
    <template #item="{ element: step, index: idx }">
      <div class="relative">
        <Icon icon="fa-solid fa-grip-vertical" class="absolute top-1 left-1 drag-handle cursor-grab text-gray-400 z-10"
          size="xsmall" v-if="step.type !== 'warmup' && hasWarmup ? idx > 1 || idx === 0 : idx > 0" />
        <Icon icon="pi pi-trash" class="text-gray-600 absolute right-0 z-10 top-0 translate-x-1/2 -translate-y-1/2"
          action size="small" v-tooltip.bottom="'Supprimer'" v-if="hasWarmup ? idx > 1 || idx === 0 : idx > 0"
          @click="handleDeleteStep(idx)" />
        <WorkoutFormRunStep v-if="step.type == 'work'" :step="step"
          @update:step="(s: RunWorkoutStep) => handleUpdateStep(s, idx)" />
        <WorkoutFormRunRecoveryStep v-if="step.type == 'recovery'" :step="step"
          @update:step="(s: RunWorkoutStep) => handleUpdateStep(s, idx)" />
        <WorkoutFormRunWarmupStep v-if="step.type == 'warmup'" :step="step"
          @update:step="(s: RunWorkoutStep) => handleUpdateStep(s, idx)" />
      </div>
    </template>
  </draggable>

  <div class="flex mt-3 justify-center mb-2 gap-2">
    <Button size="small" outlined icon="pi pi-plus" label="Exercice" @click="handleAddWorkStep" />
    <Button size="small" outlined icon="pi pi-plus" label="Récupération" @click="handleAddRecoveryStep" />
  </div>
</template>

<script setup lang="ts">
import { createWorkoutStep } from '@/domain/factories/RunWorkoutFactory';
import { RunWorkoutStep, RunWorkoutStructureWithSteps } from '@/domain/types/workout/RunWorkoutStructure';
import Icon from '@/ui/components/Icon.vue';
import WorkoutFormRunRecoveryStep from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-form/run/WorkoutFormRunRecoveryStep.vue';
import WorkoutFormRunStep from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-form/run/WorkoutFormRunStep.vue';
import WorkoutFormRunWarmupStep from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-form/run/WorkoutFormRunWarmupStep.vue';
import { Button } from 'primevue';
import { computed, ref, watch } from 'vue';
import draggable from 'vuedraggable';

const props = defineProps<{
  workout: RunWorkoutStructureWithSteps;
}>();

const internalSteps = ref(props.workout.steps);

const hasWarmup = computed(() => {
  return internalSteps.value[0].type === 'warmup';
});

const emit = defineEmits<{ 'update:workout': [workout: RunWorkoutStructureWithSteps] }>();

const handleAddWarmup = () => {
  internalSteps.value = [createWorkoutStep({ type: 'warmup' }), ...internalSteps.value];
};

const handleUpdateStep = (step: RunWorkoutStep, index: number) => {
  internalSteps.value[index] = step;
};

const handleAddWorkStep = () => {
  internalSteps.value.push(createWorkoutStep({ type: 'work' }));
};

const handleAddRecoveryStep = () => {
  internalSteps.value.push(createWorkoutStep({ type: 'recovery' }));
};

const handleDeleteStep = (index: number) => {
  internalSteps.value.splice(index, 1);
};

watch(
  internalSteps,
  () => {
    emit('update:workout', { ...props.workout, steps: internalSteps.value });
  },
  { deep: true }
);
</script>
