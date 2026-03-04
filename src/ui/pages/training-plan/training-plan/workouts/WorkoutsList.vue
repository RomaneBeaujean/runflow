<template>
  <draggable class="flex-1 flex flex-col gap-2 overflow-auto pb-5" v-model="workouts"
    :group="{ name: 'workouts', pull: 'clone', put: false }" animation="200" :sort="false" item-key="id">
    <template #item="{ element: workout }">
      <div
        class="flex items-center drag-handle cursor-grab justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group relative">

        <!-- Bar de couleur -->
        <div class="absolute top-0 bottom-0 left-0 w-[4px] rounded-tl-sm rounded-bl-sm"
          :style="getBarStyle(workout.sportId)"></div>

        <div class="flex gap-2 flex-1 p-2">

          <!-- DragDrop icon -->
          <i
            class="absolute left-[2px] fa-solid fa-grip-vertical text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mr-2" />

          <i :class="getSport(workout.sportId).icon" />
          <div class="flex flex-col gap-2">
            <div class="font-semibold text-sm">{{ workout.title }}</div>
          </div>
        </div>
        <div class="flex items-center buttons">
          <Button text icon="pi pi-pencil" size="small" class="text-gray-600" @click="handleShowUpdateModel(workout)" />
          <Button text icon="pi pi-trash" size="small" class="text-gray-600" @click="removeWorkoutModel(workout)" />
        </div>
      </div>
    </template>
  </draggable>

  <!-- Empty State -->
  <div v-if="!workoutModels || workoutModels.length === 0"
    class="flex flex-col items-center justify-center py-10 text-gray-400">
    <i class="pi pi-inbox text-4xl mb-3" />
    <p class="text-sm">Aucun modèle de séance</p>
  </div>
</template>

<script setup lang="ts">
import { getTagColor } from '@/domain/services/TagColors';
import type { Workout } from '@/domain/types/workout/Workout';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import {
  Button
} from 'primevue';
import { ref, watch } from 'vue';

import draggable from 'vuedraggable';

const props = defineProps<{
  workoutModels: Workout[]
}>();

const workouts = ref(props.workoutModels);

const { removeWorkoutModel, sports } = useTrainingPlan();

const getSport = (sportId: string) => {
  return sports.value.find((el) => el.id === sportId);
}

const getBarStyle = (sportId: string) => {
  const sport = sports.value.find((el) => el.id === sportId);
  const hexaColor = getTagColor(sport.color).color;
  return {
    backgroundColor: hexaColor
  }
}

const emit = defineEmits(["showEditModel", "update:workoutModels"]);

const handleShowUpdateModel = (workout: Workout) => {
  emit("showEditModel", workout);
}

watch(props, () => {
  workouts.value = props.workoutModels;
}, { deep: true })
</script>

<style lang="scss" scoped></style>
