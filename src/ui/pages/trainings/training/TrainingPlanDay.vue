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

            <CardTag :color="workout.sport?.color" class="drag-handle">
              <template #left v-if="workout.sport?.icon">
                <Icon :icon="workout.sport?.icon" class="group-hover:opacity-0" />
                <Icon icon="fa-solid fa-grip-vertical"
                  class="cursor-grab absolute  text-gray-500 opacity-0 group-hover:opacity-100" />
              </template>
              <div class="min-w-0 truncate">
                <span>{{ workout.title }}</span>
              </div>
              <div v-if="workout.distance || workout.duration" class="min-w-0 truncate text-gray-400 text-xs">
                <span v-if="workout.distance">{{ workout.distance }} km</span>
                <span v-if="workout.distance && workout.duration"> - </span>
                <span v-if="workout.duration">{{ minutesToFormattedDuration(workout.duration) }}</span>
              </div>
              <template #right>
                <Icon icon="pi pi-trash" action size="xsmall" @click.stop="removeWorkout(workout, trainingDay)" />
              </template>
            </CardTag>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { minutesToFormattedDuration } from '@/domain/helpers/Time.helper';
import { TrainingDay, Workout } from '@/domain/types/TrainingPlan';
import Icon from '@/ui/components/Icon.vue';
import CardTag from '@/ui/components/tags/CardTag.vue';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanParams } from '@/ui/composables/useTrainingPlanParams';
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';



const { handleShowAddWorkout, showAddWorkoutDay, isDragging, handleShowWorkoutDetails, getRealDayNumber, getWeekDayLabel } =
  useTrainingPlanParams();

const { updateWorkoutsOnDay, removeWorkout } = useTrainingPlan();

const props = defineProps<{
  trainingDay: TrainingDay;
}>();

const workouts = ref<Workout[]>(props.trainingDay.workouts);

const showAddWorkoutOnDay = () => {
  handleShowAddWorkout(props.trainingDay)
};

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
:deep(.draggable-item) {
  opacity: 0.5;

  .buttons,
  .description,
  .tags {
    display: none;
  }
}
</style>
