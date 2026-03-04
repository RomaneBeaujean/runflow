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

    <div @click="showAddWorkoutOnDay" class="absolute bottom-2 right-2" v-if="editing">
      <div class="rounded-md hover:bg-neutral-200 p-1 cursor-pointer inline-flex items-center justify-center">
        <i class="pi pi-plus"></i>
      </div>
    </div>

    <div class="flex-1 h-full flex flex-col gap-2 pt-5">
      <template v-if="editing">
        <draggable v-model="workouts" animation="200" :group="{ name: 'workouts', pull: true, put: true }" item-key="id"
          class="h-full" drag-class="workout-dragging" ghost-class="workout-ghost">
          <template #item="{ element: workout }">
            <div @click.stop="handleShowWorkoutDetails(trainingDay, workout)"
              class="cursor-pointer active:cursor-grabbing group">

              <CardTag :color="getSport(workout.sportId).background" class="drag-handle">
                <template #left>
                  <div class="relative">
                    <Icon :icon="getSport(workout.sportId).icon" class="group-hover:opacity-0" />
                    <Icon icon="fa-solid fa-grip-vertical"
                      class="cursor-grab absolute left-0 top-1 text-gray-500 opacity-0 group-hover:opacity-100" />
                  </div>
                </template>
                <div class="min-w-0 truncate font-semibold">
                  <span>{{ workout.title }}</span>
                </div>
                <template #right>
                  <Icon icon="pi pi-trash" action size="xsmall" @click.stop="removeWorkout(workout, trainingDay)" />
                </template>
              </CardTag>
            </div>
          </template>
        </draggable>

      </template>
      <template v-else>
        <template v-for="workout in workouts">
          <CardTag :color="getSport(workout.sportId).background"
            @click.stop="handleShowWorkoutDetails(trainingDay, workout)" class="cursor-pointer">
            <template #left>
              <Icon :icon="getSport(workout.sportId).icon" />
            </template>
            <div class="min-w-0 truncate font-semibold">
              <span>{{ workout.title }}</span>
            </div>
          </CardTag>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrainingDay } from '@/domain/types/TrainingPlan';
import type { Workout } from '@/domain/types/workout/Workout';
import Icon from '@/ui/components/Icon.vue';
import CardTag from '@/ui/components/card/CardTag.vue';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanHelper } from '@/ui/composables/useTrainingPlanHelper';
import { useTrainingPlanParams } from '@/ui/composables/useTrainingPlanParams';
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';

const { handleShowAddWorkout, showAddWorkoutDay, handleShowWorkoutDetails, getRealDayNumber, getWeekDayLabel } =
  useTrainingPlanParams();

const { updateWorkoutsOnDay, removeWorkout, editing } = useTrainingPlan();

const { getSport } = useTrainingPlanHelper();

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
:deep(.workout-dragging) {
  padding: 8px;

  .buttons {
    display: none;
  }
}

:deep(.workout-ghost) {
  opacity: 0.5;
  padding: 8px;


  .buttons {
    display: none;
  }
}
</style>
