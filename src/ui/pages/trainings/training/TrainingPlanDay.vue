<template>
  <div class="cell flex flex-col w-full h-full relative p-5" :data-selected="showAddWorkoutDay == trainingDay || null">
    <!-- Day Label -->
    <div class="absolute top-2 left-2 text-xs">
      {{ getWeekDayLabel(trainingDay) }}
    </div>

    <!-- Real Day Number -->
    <div class="absolute top-2 right-2 text-xs font-bold text-primary-600">
      J{{ getRealDayNumber(trainingDay) }}
    </div>

    <div @click="showAddWorkoutOnDay" class="absolute bottom-2 right-2">
      <div class="rounded-md hover:bg-neutral-200 p-1 cursor-pointer inline-flex items-center justify-center">
        <i class="pi pi-plus"></i>
      </div>

    </div>

    <div class="flex flex-col gap-2 pt-5">
      <draggable v-model="workouts" item-key="id" class="drop-zone min-h-[100px] flex flex-col gap-2"
        :class="{ 'is-dragging': isDragging }" :group="{ name: 'workouts', pull: true, put: true }" :animation="200"
        handle=".drag-handle" @start="isDragging = true" @end="isDragging = false">
        <template #item="{ element: workout }">
          <div @click.stop="handleShowWorkoutDetails(trainingDay, workout)"
            class="cursor-pointer active:cursor-grabbing group">

            <ColorTag :color="createSportTagColor(workout.sport?.color)" class="drag-handle">
              <template #left v-if="workout.sport?.icon">
                <div class="relative pl-1">
                  <i
                    class="cursor-grab absolute left-[-50%] top-[20%] fa-solid fa-grip-vertical text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity active:cursor-grabbing mr-2" />
                  <i :class="workout.sport?.icon" />
                </div>
              </template>
              <div class="min-w-0 truncate">
                {{ workout.title }}
              </div>
              <template #right>
                <div class="inline-flex items-center justify-center h-[20px] w-[20px]">
                  <i class="pi pi-times" @click.stop="removeWorkout(workout)" />
                </div>
              </template>
            </ColorTag>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createSportTagColor } from '@/domain/factories/WorkoutFactory';
import { TrainingDay, Workout } from '@/domain/types/TrainingPlan';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanParams } from '@/ui/composables/useTrainingPlanParams';
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';

const { handleShowAddWorkout, showAddWorkoutDay, isDragging, handleShowWorkoutDetails, getRealDayNumber, getWeekDayLabel } =
  useTrainingPlanParams();

const { updateWorkoutsOnDay } = useTrainingPlan();

const props = defineProps<{
  trainingDay: TrainingDay;
}>();

const workouts = ref<Workout[]>(props.trainingDay.workouts);

const showAddWorkoutOnDay = () => {
  handleShowAddWorkout(props.trainingDay)
};

const removeWorkout = (workout: Workout) => {
  const workoutIndex = workouts.value.findIndex((el) => el.id == workout.id);
  workouts.value = [...workouts.value].filter((_el, idx) => idx !== workoutIndex);
}

watch(props, () => {
  workouts.value = props.trainingDay.workouts;
});

watch(workouts, () => {
  if (props.trainingDay.workouts !== workouts.value) {
    updateWorkoutsOnDay(workouts.value, props.trainingDay);
  }
});
</script>

<style lang="scss" scoped>
.drop-zone.is-dragging {
  // ::after {
  //   content: 'Déposer une séance ici';
  //   font-size: 10px;
  //   color: #9ca3af;
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  //   height: 100%;
  // }
}

:deep(.draggable-item) {
  opacity: 0.5;

  .buttons {
    display: none;
  }
}
</style>
