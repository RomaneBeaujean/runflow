<template>
  <Drawer v-model:opened="showWorkoutModels" position="right" width="564px">

    <template #header v-if="showWorkoutModels">
      <div class="flex justify-between items-center">
        <div class="flex-1 font-bold text-xl">Bibliothèque de séances</div>
        <div class="flex-0">
          <Button text icon="pi pi-plus" size="small" @click="handleShowAddWorkout" v-if="!showAddModel" />
        </div>
      </div>
    </template>

    <!-- Body  -->
    <div class="flex-1 flex flex-col gap-2" v-if="showWorkoutModels">
      <div v-if="!showEditModel && !showAddModel">
        <!-- <div class="flex gap-2 items-center mb-4">
          <div>
            <SelectSport v-model:selected="searchSportValue" showClear />
          </div>
          <div class="flex-1">
            <FloatLabel variant="in">
              <InputText id="title" v-model="searchModelValue" class="w-full" />
              <label for="title">Rechercher un modèle</label>
            </FloatLabel>
          </div>
        </div> -->
        <WorkoutsList @showEditModel="handleShowEditModel" v-model:workoutModels="displayedModels" />
      </div>
      <div v-if="showEditModel">
        <div class="flex flex-col gap-3">
          <Button link label="Retour à la bibliothèque" icon="pi pi-arrow-left" @click="handleCloseEdition" />
          <div class="text-md font-bold">Modifier le modèle</div>
          <Message severity="warn" class="max-w-full">
            La modification sera appliquée aux séances planifiées avec ce modèle
          </Message>
          <WorkoutForm v-model:workout="editedWorkout" :titleMessage="titleMessage" />
        </div>
      </div>
      <div v-if="showAddModel">
        <div class="flex flex-col gap-3">
          <Button link label="Retour à la bibliothèque" icon="pi pi-arrow-left" @click="handleCloseEdition" />
          <div class="text-md font-bold">Ajouter un modèle</div>
          <WorkoutForm v-model:workout="editedWorkout" :titleMessage="titleMessage" />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Fermer" variant="outlined" @click="handleClose" v-if="!showEditModel" />
        <Button label="Annuler" variant="outlined" v-if="showEditModel" @click="handleCloseEdition" />
        <Button label="Enregistrer le modèle" icon="pi pi-save" v-if="showAddModel" @click="handleAddModel" />
        <Button label="Enregistrer les modifications" icon="pi pi-save" v-if="showEditModel" :disabled="isDisabled"
          @click="handleSaveModel" />
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
  Message
} from 'primevue';
import { computed, ref } from 'vue';

import { createRunWorkout } from '@/domain/factories/RunWorkoutFactory';
import type { Workout } from '@/domain/types/workout/Workout';
import { useTrainingPlanHelper } from '@/ui/composables/useTrainingPlanHelper';
import WorkoutsList from './WorkoutsList.vue';
import WorkoutForm from './workout/workout-form/WorkoutForm.vue';
const { showWorkoutModels, handleCloseWorkoutModels } = useTrainingPlanParams();
const { isTitleExist, isFormValid } = useTrainingPlanHelper();
const { workoutModels, updateWorkoutModel, addWorkoutModel } = useTrainingPlan();

const searchModelValue = ref(null);
const searchSportValue = ref(null);
const showAddModel = ref(false);
const showEditModel = ref(false);
const initialWorkout = ref(null);
const editedWorkout = ref(null);

const displayedModels = computed(() => {
  return [...workoutModels.value].filter((m) => {
    const sportOk = searchSportValue.value ? m.sportId == searchSportValue.value : true;
    const titleOk = searchModelValue.value ? m.title.match(searchModelValue.value) : true;
    return sportOk && titleOk;
  })
});

const titleMessage = computed(() => {
  if (isTitleExist(editedWorkout.value)) return {
    severity: 'error',
    message: 'Ce titre de séance est déjà utilisé pour ce sport'
  }
  return null;
});

const isDisabled = computed(() => {
  return !isFormValid(editedWorkout.value, initialWorkout.value);
})

const handleClose = () => {
  handleCloseWorkoutModels()
};

const handleShowAddWorkout = () => {
  showAddModel.value = false;
  showAddModel.value = true;
  editedWorkout.value = createRunWorkout();
}

const handleShowEditModel = (model: Workout) => {
  showEditModel.value = true;
  initialWorkout.value = { ...model };
  editedWorkout.value = { ...model };
}

const handleCloseEdition = () => {
  showEditModel.value = false;
  showAddModel.value = false;
  editedWorkout.value = null;
  initialWorkout.value = null;
}

const handleAddModel = () => {
  addWorkoutModel(editedWorkout.value);
  handleCloseEdition();
}


const handleSaveModel = () => {
  updateWorkoutModel(editedWorkout.value);
  handleCloseEdition();
}

</script>

<style lang="scss" scoped></style>
