<template>
  <Drawer v-model:opened="showWorkoutModels" position="right" class="border-l border-l-gray-200">

    <template #header v-if="showWorkoutModels">
      <div class="flex justify-between items-center">
        <div class="flex-1 font-bold text-xl">Bibliothèque de séances</div>
        <div class="flex-0">
          <Button text icon="pi pi-plus" size="small" @click="handleShowAddWorkout" />
        </div>
      </div>
    </template>

    <!-- Body  -->
    <div class="flex-1 flex flex-col gap-2 w-[400px]" v-if="showWorkoutModels">
      <div v-if="!showEditModel && !showAddModel">
        <div class="flex gap-2 mb-4">
          <div class="flex-1">
            <FloatLabel variant="in">
              <InputText id="title" v-model="searchModelValue" class="w-full" />
              <label for="title">Rechercher un modèle</label>
            </FloatLabel>
          </div>
          <div class="flex-1">
            <SelectSport v-model:selectedSport="searchSportValue" showClear />
          </div>
        </div>
        <WorkoutModelList @showEditModel="handleShowEditModel" v-model:workoutModels="displayedModels" />
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
        <Button label="Enregistrer le modèle" icon="pi pi-save" v-if="showAddModel" :disabled="isSaveButtonDisabled"
          @click="handleAddModel" />
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
  FloatLabel,
  InputText,
  Message
} from 'primevue';
import { computed, ref } from 'vue';

import { createWorkout } from '@/domain/factories/WorkoutFactory';
import { Workout } from '@/domain/types/TrainingPlan';
import SelectSport from '@/ui/components/select/SelectSport.vue';
import WorkoutForm from '@/ui/components/workout/WorkoutForm.vue';
import { useTrainingPlanHelper } from '@/ui/composables/useTrainingPlanHelper';
import WorkoutModelList from './WorkoutModelList.vue';
const { showWorkoutModels, handleCloseWorkoutModels } = useTrainingPlanParams();
const { isSameWorkout } = useTrainingPlanHelper();
const { workoutModels, updateWorkoutModel, addWorkoutModel } = useTrainingPlan();

const searchModelValue = ref(null);
const searchSportValue = ref(null);
const showAddModel = ref(false);
const showEditModel = ref(false);
const initialWorkout = ref(null);
const editedWorkout = ref(null);

const displayedModels = computed(() => {
  return [...workoutModels.value].filter((m) => {
    const sportOk = searchSportValue.value ? m.sport.label == searchSportValue.value.label : true;
    const titleOk = searchModelValue.value ? m.title.match(searchModelValue.value) : true;
    return sportOk && titleOk;
  })
});

const isSaveButtonDisabled = computed(() => {
  if (isTitleExist.value) return true;
  const isSame = isSameWorkout(initialWorkout.value, editedWorkout.value);
  return isSame || !editedWorkout.value.title || !editedWorkout.value.sport;
});

const isTitleExist = computed(() => {
  if (!editedWorkout.value) return false;
  const otherTitles = workoutModels.value.filter((el) => el.id !== editedWorkout.value.id).map((el) => el.title);
  const exist = otherTitles.includes(editedWorkout.value.title);
  return exist
})

const titleMessage = computed(() => {
  if (isTitleExist.value) return {
    severity: 'error',
    message: 'Ce titre de séance est déjà utilisé pour ce sport'
  }
  return null;
});

const handleClose = () => {
  handleCloseWorkoutModels()
};

const handleShowAddWorkout = () => {
  showAddModel.value = false;
  showAddModel.value = true;
  editedWorkout.value = createWorkout();
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
