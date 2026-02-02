<template>
  <Drawer v-model:opened="showWorkoutDetails" position="right" id="workoutDetails" showCloseButton>
    <template #header v-if="showWorkoutDetailsDay">
      <div class="font-bold text-xl">Détail de la séance</div>
      <div class="flex justify-between">
        <div class="font-regular text-md mt-2 flex flex-1 items-center gap-2">
          <ColorTag color="primary"
            :label="'Semaine ' + showWorkoutDetailsDay.weekNumber + ' · ' + getWeekDayLabel(showWorkoutDetailsDay)" />
          <ColorTag color="orange" :label="'J' + getRealDayNumber(showWorkoutDetailsDay)" />
        </div>
        <div v-if="readonly" class="mt-3">
          <Button icon="fa-solid fa-calendar-xmark" text label="Supprimer la plannification" severity="danger"
            size="small" @click="removePlanification" />
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-3 w-[400px]" v-if="showWorkoutDetailsDay">
      <template v-if="isSaved">
        <Message severity="info" class="max-w-full">
          Cette séance provient de la bibliothèque de modèles
        </Message>
        <template v-if="!readonly">
          <div class="text-md font-bold">Modifier le modèle de séance</div>
          <Message v-if="isSaved" severity="warn" class="max-w-full">
            La modification sera appliquée aux séances planifiées avec ce modèle
          </Message>
        </template>

      </template>
      <template v-else>
        <div v-if="!readonly" class="text-md font-bold">Modifier la séance</div>
      </template>
      <WorkoutForm v-model:workout="workout" v-model:readonly="readonly" :titleMessage="titleMessage" />
    </div>

    <template #footer v-if="showWorkoutDetailsDay">
      <div class="flex justify-end gap-2">
        <template v-if="isSaved">
          <template v-if="readonly">
            <Button icon="pi pi-trash" text label="Supprimer de la bibliothèque" severity="danger" size="small"
              @click="deleteFromModels" />
            <Button icon="pi pi-pencil" label="Modifier le modèle" outlined size="small" @click="readonly = false"
              v-if="readonly" />
          </template>
          <template v-else>
            <Button label="Annuler" outlined size="small" @click="closeModification" />
            <Button icon="pi pi-save" label="Enregistrer les modifications" size="small" @click="saveWorkoutModel"
              :disabled="isSaveButtonDisabled" />
          </template>
        </template>
        <template v-else>
          <template v-if="readonly">
            <Button icon="pi pi-save" label="Enregistrer dans la bibliothèque" outlined size="small"
              @click="handleSaveWorkout" />
            <Button icon="pi pi-pencil" label="Modifier" outlined size="small" @click="readonly = false" />
          </template>
          <template v-else>
            <Button label="Annuler" outlined size="small" @click="closeModification" />
            <Button icon="pi pi-save" label="Enregistrer les modifications" size="small" @click="saveWorkout"
              :disabled="isSaveButtonDisabled" />
          </template>
        </template>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { Workout } from '@/domain/types/TrainingPlan';
import Drawer from '@/ui/components/drawer/Drawer.vue';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import WorkoutForm from '@/ui/components/workout/WorkoutForm.vue';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanHelper } from '@/ui/composables/useTrainingPlanHelper';
import { useTrainingPlanParams } from '@/ui/composables/useTrainingPlanParams';
import { Button, Message } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';

const { workoutModels, addWorkoutModel, updatePlannedWorkout, updateWorkoutModel, removeWorkoutModel, removeWorkout } = useTrainingPlan();
const { showWorkoutDetails, showWorkoutDetailsWorkout, showWorkoutDetailsDay, getRealDayNumber, getWeekDayLabel, handleCloseWorkoutDetails } = useTrainingPlanParams();
const { isSameWorkout } = useTrainingPlanHelper();
const workout = ref<Workout>();
const readonly = ref<boolean>(true);
const isSaved = ref<boolean>(false);

const isSaveButtonDisabled = computed(() => {
  if (isTitleExist.value) return true;
  const isSame = isSameWorkout(showWorkoutDetailsWorkout.value, workout.value)
  return isSame || !workout.value.title || !workout.value.sport;
});

const isTitleExist = computed(() => {
  if (!workout.value) return false;
  const otherTitles = workoutModels.value.filter((el) => el.id !== workout.value.id).map((el) => el.title);
  const exist = otherTitles.includes(workout.value.title);
  return exist
})

const titleMessage = computed(() => {
  if (isTitleExist.value) return {
    severity: 'error',
    message: 'Ce titre de séance est déjà utilisé pour ce sport'
  }
  return null;
});

onMounted(() => {
  workout.value = { ...showWorkoutDetailsWorkout.value }
  isSaved.value = workoutModels.value.some((w) => w?.id === showWorkoutDetailsWorkout.value?.id);
});

const saveWorkout = () => {
  updatePlannedWorkout(showWorkoutDetailsDay.value, workout.value);
  showWorkoutDetailsWorkout.value = workout.value;
  readonly.value = true;
}

const saveWorkoutModel = () => {
  updateWorkoutModel(workout.value);
  showWorkoutDetailsWorkout.value = workout.value;
  readonly.value = true;

}

const deleteFromModels = () => {
  removeWorkoutModel(workout.value);
  isSaved.value = false;

}
const handleSaveWorkout = () => {
  addWorkoutModel(workout.value);
  isSaved.value = true;
}

const removePlanification = () => {
  removeWorkout(workout.value, showWorkoutDetailsDay.value);
  handleCloseWorkoutDetails();
}

const closeModification = () => {
  workout.value = { ...showWorkoutDetailsWorkout.value };
  isSaved.value = workoutModels.value.some((w) => w.id === showWorkoutDetailsWorkout.value?.id);
  readonly.value = true;
};

watch(showWorkoutDetails, () => {
  if (!showWorkoutDetails.value) {
    workout.value = null;
    readonly.value = true;
    isSaved.value = false;
  } else {
    workout.value = { ...showWorkoutDetailsWorkout.value };
    isSaved.value = workoutModels.value.some((w) => w.id === showWorkoutDetailsWorkout.value?.id);
  }
})
</script>

<style lang="scss" scoped></style>
