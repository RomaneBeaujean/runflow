<template>
  <div v-if="id" class="p-5 flex flex-col w-full h-full">
    <div class="flex md:flex-row md:justify-between flex-col items-center mb-2">
      <div class="flex flex-1">
        <Breadcrumb :model="breadcrumbItems" class="text-sm"></Breadcrumb>
      </div>
      <div>
        <div class="flex flex-row flex-0 items-center gap-2">
          <div>
            <SwitchToggle label="Mode édition" v-model:value="editing" />
          </div>
          <div>
            <Button icon="pi pi-file-export" text rounded v-tooltip.bottom="'Exporter'" @click="exportFile"></Button>
          </div>
        </div>
      </div>
    </div>
    <div id="card" class="flex-1 min-h-0">
      <Card class="training-card w-full h-full relative">
        <template #title>
          <div class="flex justify-between flex-1">
            <div class="flex group hover:flex-1 focus-within:flex-1">
              <div class="flex flex-col group-hover:hidden group-focus-within:hidden">
                <div class="text-md">
                  {{ name }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ description }}
                </div>
              </div>
              <div v-if="editing" class="hidden flex-1 group-hover:flex group-focus-within:flex flex-col gap-2">
                <div class="flex-1">
                  <InputText v-model="editableName" :invalid="isNameInvalid" @change="handleSave" fluid />
                  <Message v-if="isNameExist" severity="error" variant="simple">
                    Ce nom de plan d'entrainement existe déjà. Veuillez en choisir un autre.
                  </Message>
                  <Message v-if="!editableName" severity="error" variant="simple">
                    Veuillez saisir un nom
                  </Message>
                </div>
                <div class="flex-1">
                  <Textarea fluid v-model="editableDescription" placeholder="Description" @change="handleSave" />
                </div>
              </div>
            </div>
            <div v-if="editing">
              <Button :text="!showWorkoutModels" icon="fa-solid fa-book-bookmark"
                :label="isMobile ? '' : 'Bibliothèque de séances'" @click="handleShowModels" />
            </div>
          </div>
        </template>
        <template #content>
          <div class="w-full h-full flex">
            <div class="flex-1 overflow-auto p-5">
              <TrainingPlanWeek v-for="tw in weeks" :key="tw.weekNumber" :trainingWeek="tw" :editing="editing" />
            </div>
            <AddWorkout v-if="editing" />
            <WorkoutsLibrary v-if="editing" />
            <WorkoutDetails />
          </div>
        </template>
        <template #footer v-if="editing">
          <div class="flex justify-end">
            <div class="flex gap-4 mt-1">
              <Button label="Ajouter une semaine" variant="outlined" icon="pi pi-plus" @click="addNewWeek" />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import SwitchToggle from '@/ui/components/inputs/SwitchToggle.vue';
import { useStores } from '@/ui/composables/useStores';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanParams } from '@/ui/composables/useTrainingPlanParams';
import { useTrainingPlans } from '@/ui/composables/useTrainingPlans';
import { useViewport } from '@/ui/composables/useViewport';
import { Breadcrumb, Button, Card, InputText, Message, Textarea } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import TrainingPlanWeek from './TrainingPlanWeek.vue';
import AddWorkout from './workouts/AddWorkout.vue';
import WorkoutDetails from './workouts/WorkoutDetails.vue';
import WorkoutsLibrary from './workouts/WorkoutsLibrary.vue';

const props = defineProps<{ id: string }>();
const { isMobile } = useViewport();
const { init, addNewWeek, updateName, updateDescription, id, name, weeks, description, editing } = useTrainingPlan();
const { showWorkoutModels, handleShowWorkoutModels, handleCloseWorkoutModels } = useTrainingPlanParams();
const { isTrainingPlanNameExist } = useTrainingPlans();
const stores = useStores();

const editableName = ref(name.value);
const editableDescription = ref(description.value)

onMounted(() => {
  initComposables();
  editableName.value = name.value;
  editableDescription.value = description.value;
})

const isNameInvalid = computed(() => {
  return !editableName.value || isNameExist.value
})

const isNameExist = computed(() => {
  return isTrainingPlanNameExist(name.value, editableName.value)
});

const breadcrumbItems = computed(() => {
  return [
    { label: "Plans d'entrainement", url: '/trainings' },
    { label: name.value, disabled: true },
  ];
})

const initComposables = async () => {
  if (!props.id) return;
  const data = stores.training_plans_store.getById(props.id);
  if (!data) return;
  init(data);
};

const handleShowModels = () => {
  if (showWorkoutModels.value) {
    handleCloseWorkoutModels()
  } else {
    handleShowWorkoutModels()
  }
}
const handleSave = async () => {
  updateName(editableName.value);
  updateDescription(editableDescription.value)
};

const exportFile = () => {
  const trainingPlanObj = stores.training_plans_store.getById(props.id);
  if (!trainingPlanObj) return;

  const json = JSON.stringify(trainingPlanObj, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeName = (trainingPlanObj.name || 'plan-d-entrainement')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]/g, '');

  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.tp.runflow.json`;
  a.click();

  URL.revokeObjectURL(url);
};

watch(name, () => {
  editableName.value = name.value;
})

watch(description, () => {
  editableDescription.value = description.value;
})

watch(
  () => props.id,
  () => initComposables()
);

</script>

<style lang="scss">
.training-card {
  .p-card-body {
    flex: 1 1 auto;
    height: 100%;
    padding: 0;
    gap: 0;

    .p-card-caption {
      padding: 16px;
      border-bottom: 1px solid var(--color-gray-200);
    }

    .p-card-footer {
      padding: 16px;
      border-top: 1px solid var(--color-gray-200);
    }

    .p-card-content {
      flex: 1 1 auto;
      height: 100%;
      position: relative;
      min-height: 400px;
      overflow: hidden;
    }
  }
}
</style>
