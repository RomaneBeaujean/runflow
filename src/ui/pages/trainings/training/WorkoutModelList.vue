<template>
  <draggable class="flex-1 flex flex-col gap-2 overflow-auto pb-5" :modelValue="workoutModels" item-key="id"
    :class="{ 'is-dragging': isDragging }" chosen-class="draggable-item" @start="isDragging = true"
    @end="isDragging = false" :group="{ name: 'workouts', pull: 'clone', put: false }" handle=".drag-handle"
    :clone="cloneWorkout">
    <template #item="{ element: workout }">
      <div
        class="flex items-center drag-handle cursor-grab justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group relative">
        <div class="flex gap-2 flex-1 p-2">
          <i
            class="absolute left-0 fa-solid fa-grip-vertical text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mr-2" />

          <i :class="workout.sport.icon" />
          <div class="flex flex-col gap-2">
            <div class="font-semibold text-sm">{{ workout.title }}</div>
            <div class="description text-xs text-gray-500">{{ workout.description }}</div>

            <div class="inline-flex tags gap-2">
              <ColorTag color="primary" v-if="workout.distance">{{ workout.distance }} <small>km</small></ColorTag>
              <ColorTag color="green" icon="pi pi-stopwatch" v-if="workout.duration">
                {{ minutesToFormattedDuration(workout.duration) }}
              </ColorTag>
            </div>
          </div>
        </div>
        <div class="flex items-center buttons">
          <Button text icon="pi pi-pencil" size="small" class="text-gray-600" @click="handleShowUpdateModel(workout)" />
          <Button text icon="pi pi-trash" size="small" class="text-gray-600" @click="removeWorkoutModel(workout)" />
        </div>
      </div>
    </template>
  </draggable>
  <div v-if="!workoutModels || workoutModels.length === 0"
    class="flex flex-col items-center justify-center py-10 text-gray-400">
    <i class="pi pi-inbox text-4xl mb-3" />
    <p class="text-sm">Aucun modèle de séance</p>
  </div>
</template>

<script setup lang="ts">
import { minutesToFormattedDuration } from '@/domain/helpers/Time.helper';
import { Workout } from '@/domain/types/TrainingPlan';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanParams } from '@/ui/composables/useTrainingPlanParams';
import {
  Button
} from 'primevue';

import draggable from 'vuedraggable';

const props = defineProps<{
  workoutModels: Workout[]
}>();

const { isDragging } = useTrainingPlanParams();
const { removeWorkoutModel } = useTrainingPlan();

const emit = defineEmits(["showEditModel", "update:workoutModels"]);

const cloneWorkout = (workout: Workout) => { return { ...workout } };

const handleShowUpdateModel = (workout: Workout) => {
  emit("showEditModel", workout);
}
</script>

<style lang="scss" scoped></style>
