<template>
  <Drawer v-model:opened="showWorkoutDetails" overlay position="right" id="workoutDetails" showCloseButton>
    <template #header v-if="showWorkoutDetailsDay">
      <div class="font-bold text-xl">Détail de la séance</div>
      <div class="font-regular text-md mt-2 flex gap-2">
        <ColorTag color="primary"
          :label="'Semaine ' + showWorkoutDetailsDay.weekNumber + ' · ' + getWeekDayLabel(showWorkoutDetailsDay)" />
        <ColorTag color="orange" :label="'J' + getRealDayNumber(showWorkoutDetailsDay)" />
      </div>
    </template>

    <div class="flex flex-col gap-3 w-[400px]" v-if="showWorkoutDetailsDay">
      <div v-if="!readonly" class="text-md font-bold">Modifier la séance</div>
      <WorkoutForm v-model:workout="workout" v-model:readonly="readonly" />
    </div>

    <template #footer v-if="showWorkoutDetailsDay">
      <!-- <div class="flex justify-end items-center gap-1">
        <Button icon="pi pi-pencil" label="Modifier" outlined size="small" @click="readonly = false" v-if="readonly" />
      </div> -->
      <Message v-if="isSaved" severity="info" class="max-w-full">
        Cette séance provient de la bibliothèque de modèles
      </Message>
      <div class="flex justify-end" v-if="!isSaved">
        <Button icon="pi pi-pencil" label="Modifier" outlined size="small" @click="readonly = false" v-if="readonly" />
        <div v-else class="flex gap-2">
          <Button label="Annuler" outlined size="small" @click="closeModification" />
          <Button icon="pi pi-save" label="Enregistrer les modifications" size="small" @click="saveWorkout"
            :disabled="isSaveButtonDisabled" />
        </div>
      </div>
      <!-- <SwitchToggle label="Enregistrer dans la bibliothèque de modèles" v-model="saveModelOnLibrary" /> -->
    </template>

  </Drawer>
</template>

<script setup lang="ts">
import { Workout } from '@/domain/types/TrainingPlan';
import Drawer from '@/ui/components/drawer/Drawer.vue';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import WorkoutForm from '@/ui/components/workout/WorkoutForm.vue';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanParams } from '@/ui/composables/useTrainingPlanParams';
import { Button, Message } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';

const { workoutModels, updatePlannedWorkout } = useTrainingPlan();
const { showWorkoutDetails, showWorkoutDetailsWorkout, showWorkoutDetailsDay, getRealDayNumber, getWeekDayLabel, handleCloseWorkoutDetails } = useTrainingPlanParams();

const workout = ref<Workout>();
const readonly = ref<boolean>(true);
const isSaved = ref<boolean>(false);

const isSaveButtonDisabled = computed(() => {

  const model = showWorkoutDetailsWorkout.value;

  const isSame =
    workout.value.title === model.title &&
    workout.value.description === model.description &&
    workout.value.distance === model.distance &&
    workout.value.duration === model.duration &&
    workout.value.sport?.label === model.sport?.label;

  return isSame || !workout.value.title || !workout.value.sport;
});

onMounted(() => {
  workout.value = { ...showWorkoutDetailsWorkout.value }
  isSaved.value = workoutModels.value.some((w) => w.id === showWorkoutDetailsWorkout.value.id);
})

const saveWorkout = () => {
  updatePlannedWorkout(showWorkoutDetailsDay.value, workout.value);
  handleCloseWorkoutDetails();
}

const closeModification = () => {
  workout.value = { ...showWorkoutDetailsWorkout.value };
  isSaved.value = workoutModels.value.some((w) => w.id === showWorkoutDetailsWorkout.value.id);
  readonly.value = true;
};

watch(showWorkoutDetails, () => {
  if (!showWorkoutDetails.value) {
    workout.value = null;
    readonly.value = true;
    isSaved.value = false;
  } else {
    workout.value = { ...showWorkoutDetailsWorkout.value };
    isSaved.value = workoutModels.value.some((w) => w.id === showWorkoutDetailsWorkout.value.id);
  }
})
</script>

<style lang="scss" scoped></style>
