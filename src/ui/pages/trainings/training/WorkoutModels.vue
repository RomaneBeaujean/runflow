<template>
  <Drawer v-model:opened="showWorkoutModels" position="right" class="border-l border-l-gray-200">

    <template #header v-if="showWorkoutModels">
      <div class="flex justify-between items-center">
        <div class="flex-1 font-bold text-xl">Bibliothèque de séances</div>
        <div class="flex-0">
          <Button text icon="pi pi-plus" size="small" />
        </div>
      </div>
    </template>

    <!-- Body  -->
    <div class="flex-1 flex flex-col gap-2 w-[400px]" v-if="showWorkoutModels">

      <div v-if="!showEditModel">
        <div class="flex gap-2 mb-4">
          <div class="flex-1">
            <InputText placeholder="Rechercher un modèle" class="w-full" size="small" />
          </div>
          <div class="flex-0">
            <Select :options="sports" placeholder="Sport pratiqué" optionLabel="label" class="w-[140px]" size="small" />
          </div>
        </div>
        <WorkoutModelList @showEditModel="handleShowEditModel" />
      </div>
      <div v-if="showEditModel">
        <div class="flex flex-col gap-3">
          <Button link label="Retour à la bibliothèque" icon="pi pi-arrow-left" @click="handleCloseEdition" />
          <div class="text-md font-bold">Modifier le modèle</div>
          <Message severity="warn" class="max-w-full">
            La modification du modèle entrainera la modification des séances planifiées avec ce modèle
          </Message>
          <WorkoutForm v-model:workout="editedWorkout" :titleMessage="titleMessage" />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Fermer" variant="outlined" @click="handleClose" v-if="!showEditModel" />
        <Button label="Annuler" variant="outlined" v-if="showEditModel" @click="handleCloseEdition" />
        <Button label="Enregistrer les modifications" icon="pi pi-save" v-if="showEditModel"
          :disabled="isSaveButtonDisabled" @click="handleSaveModel" />
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import Drawer from '@/ui/components/drawer/Drawer.vue';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanParams } from '@/ui/composables/useTrainingPlanParams';
import {
  Button,
  InputText,
  Message,
  Select
} from 'primevue';
import { computed, ref } from 'vue';

import { Workout } from '@/domain/types/TrainingPlan';
import WorkoutForm from '@/ui/components/workout/WorkoutForm.vue';
import WorkoutModelList from './WorkoutModelList.vue';
const { showWorkoutModels, handleCloseWorkoutModels } = useTrainingPlanParams();

const { workoutModels, sports, updateWorkoutModel } = useTrainingPlan();

const showEditModel = ref(false);
const initialWorkout = ref(null);
const editedWorkout = ref(null);

const isTitleExist = computed(() => {
  if (!editedWorkout.value) return false;
  return workoutModels.value.some((model) => model.title !== initialWorkout.value.title && (model.title === editedWorkout.value.title && model.sport.label === editedWorkout.value.sport?.label));
})

const titleMessage = computed(() => {
  if (isTitleExist.value) return {
    severity: 'error',
    message: 'Ce titre de séance est déjà utilisé pour ce sport'
  }
  return null;
});

const isSaveButtonDisabled = computed(() => {

  const model = initialWorkout.value;

  const isSame =
    editedWorkout.value.title === model.title &&
    editedWorkout.value.description === model.description &&
    editedWorkout.value.distance === model.distance &&
    editedWorkout.value.duration === model.duration &&
    editedWorkout.value.sport?.label === model.sport?.label;

  return isSame || !editedWorkout.value.title || !editedWorkout.value.sport;
});


const handleClose = () => {
  handleCloseWorkoutModels()
};

const handleShowEditModel = (model: Workout) => {
  showEditModel.value = true;
  initialWorkout.value = { ...model };
  editedWorkout.value = { ...model };
}

const handleCloseEdition = () => {
  showEditModel.value = false;
  editedWorkout.value = null;
  initialWorkout.value = null;
}

const handleSaveModel = () => {
  updateWorkoutModel(editedWorkout.value);
  handleCloseEdition();
}

</script>

<style lang="scss" scoped></style>
