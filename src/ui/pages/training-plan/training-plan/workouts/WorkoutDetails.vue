<template>
  <Drawer v-model:opened="showWorkoutDetails" position="right" overlay id="workoutDetails" showCloseButton
    width="564px">
    <template #header v-if="showWorkoutDetails && internalWorkout">
      <div class="font-bold text-xl">Détail de la séance</div>
      <div class="flex justify-between">
        <div class="font-regular text-md mt-2 flex flex-1 items-center gap-2">
          <ColorTag color="primary"
            :label="'Semaine ' + showWorkoutDetailsDay.weekNumber + ' · ' + getWeekDayLabel(showWorkoutDetailsDay)" />
          <ColorTag color="orange" :label="'J' + getRealDayNumber(showWorkoutDetailsDay)" />
        </div>
        <div v-if="readonly && editing">
          <Button icon="fa-solid fa-calendar-xmark" text label="Supprimer la plannification" severity="danger"
            size="small" @click="removePlanification" />
        </div>
      </div>
    </template>
    <template v-if="showWorkoutDetails && internalWorkout">
      <div class="flex flex-col gap-2">
        <template v-if="isSaved && editing">
          <Message v-if="!readonly" severity="warn" class="max-w-full">
            La modification sera appliquée aux séances planifiées avec ce modèle
          </Message>
          <Message v-else severity="secondary" class="max-w-full">
            <div class="w-full flex gap-2 items-center">
              Cette séance provient de la bibliothèque de modèles
            </div>
          </Message>
        </template>

        <div class="mt-5">
          <WorkoutRead v-if="readonly" :workout="internalWorkout" />
          <WorkoutForm v-else v-model:workout="internalWorkout" :titleMessage="titleMessage" />
        </div>
      </div>
    </template>
    <template #footer v-if="showWorkoutDetails && internalWorkout && editing">
      <div class="flex flex-row gap-2 justify-end">

        <!-- Séance modèle de la bibliothèque -->
        <template v-if="isSaved">
          <template v-if="readonly">
            <Button icon="pi pi-times-circle" outlined label="Supprimer de la bibliothèque" severity="danger"
              size="small" @click="deleteFromModels" />
            <Button icon="pi pi-pencil" label="Modifier le modèle" outlined size="small" @click="readonly = false"
              v-if="readonly" />
          </template>
          <template v-else>
            <Button label="Annuler" outlined size="small" @click="closeModification" />
            <Button icon="pi pi-save" label="Enregistrer les modifications" size="small" @click="saveWorkoutModel"
              :disabled="isSubmitButtonDisabled" />
          </template>
        </template>

        <!-- Séance non enregistrée -->
        <template v-else>
          <template v-if="readonly">
            <Button icon="pi pi-save" label="Enregistrer dans la bibliothèque" outlined size="small"
              @click="handleSaveWorkout" severity="success" />
            <Button icon="pi pi-pencil" label="Modifier la séance" outlined size="small" @click="readonly = false" />
          </template>
          <template v-else>
            <Button label="Annuler" outlined size="small" @click="closeModification" />
            <Button icon="pi pi-save" label="Enregistrer les modifications" size="small" @click="saveWorkout"
              :disabled="isSubmitButtonDisabled" />
          </template>
        </template>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import type { Workout } from '@/domain/types/workout/Workout';
import Drawer from '@/ui/components/drawer/Drawer.vue';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanHelper } from '@/ui/composables/useTrainingPlanHelper';
import { useTrainingPlanParams } from '@/ui/composables/useTrainingPlanParams';
import WorkoutForm from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-form/WorkoutForm.vue';
import WorkoutRead from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-read/WorkoutRead.vue';
import { Button, Message } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';

const { workoutModels, editing, addWorkoutModel, updatePlannedWorkout, updateWorkoutModel, removeWorkoutModel, removeWorkout } = useTrainingPlan();
const { showWorkoutDetails, showWorkoutDetailsWorkout, showWorkoutDetailsDay, getRealDayNumber, getWeekDayLabel, handleCloseWorkoutDetails } = useTrainingPlanParams();
const { isFormValid, isTitleExist } = useTrainingPlanHelper();

const internalWorkout = ref<Workout>(null);
const readonly = ref<boolean>(true);
const isSaved = ref<boolean>(false);

const isSubmitButtonDisabled = computed(() => {
  return !isFormValid(internalWorkout.value, showWorkoutDetailsWorkout.value);
});

const titleMessage = computed(() => {
  if (isTitleExist(internalWorkout.value)) return {
    severity: 'error',
    message: 'Ce titre de séance est déjà utilisé pour ce sport'
  }
  return null;
});

onMounted(() => {
  internalWorkout.value = { ...showWorkoutDetailsWorkout.value }
  isSaved.value = workoutModels.value.some((w) => w?.id === showWorkoutDetailsWorkout.value?.id);
});

const saveWorkout = () => {
  updatePlannedWorkout(showWorkoutDetailsDay.value, internalWorkout.value);
  showWorkoutDetailsWorkout.value = internalWorkout.value;
  readonly.value = true;
}

const saveWorkoutModel = () => {
  updateWorkoutModel(internalWorkout.value);
  showWorkoutDetailsWorkout.value = internalWorkout.value;
  readonly.value = true;

}

const deleteFromModels = () => {
  removeWorkoutModel(internalWorkout.value);
  isSaved.value = false;

}
const handleSaveWorkout = () => {
  addWorkoutModel(internalWorkout.value);
  isSaved.value = true;
}

const removePlanification = () => {
  removeWorkout(internalWorkout.value, showWorkoutDetailsDay.value);
  handleCloseWorkoutDetails();
}

const closeModification = () => {
  internalWorkout.value = { ...showWorkoutDetailsWorkout.value };
  isSaved.value = workoutModels.value.some((w) => w.id === showWorkoutDetailsWorkout.value?.id);
  readonly.value = true;
};

watch(showWorkoutDetails, () => {
  if (!showWorkoutDetails.value) {
    internalWorkout.value = null;
    readonly.value = true;
    isSaved.value = false;
  } else {
    internalWorkout.value = { ...showWorkoutDetailsWorkout.value };
    isSaved.value = workoutModels.value.some((w) => w.id === showWorkoutDetailsWorkout.value?.id);
  }
})

watch(internalWorkout, () => {
}, { deep: true })
</script>

<style lang="scss" scoped>
:deep(.p-message-text) {
  width: 100%;
}
</style>
