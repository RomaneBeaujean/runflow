<template>
  <div v-if="id" id="training" class="p-5 flex flex-col w-full h-full">
    <div id="header" class="flex justify-between items-center">
      <Breadcrumb :model="breadcrumbItems" class="text-sm"></Breadcrumb>
      <div id="menu">
        <div v-if="!editing" class="flex flex-row flex-0">
          <TrainingPlanEllipsisMenu :trainingPlanId="id" :edit="startEditing" />
        </div>
        <div v-if="editing" class="flex gap-1">
          <Button icon="pi pi-check" rounded @click="saveEdit" :disabled="isButtonDisabled" />
          <Button icon="pi pi-times" rounded @click="cancelEdit" />
        </div>
      </div>
    </div>
    <div id="card" class="flex-1 min-h-0">
      <Card class="training-card w-full h-full relative">
        <template #title>
          <div class="flex justify-between items-center">
            <div v-if="!editing">
              {{ name }}
            </div>
            <div v-else>
              <FloatLabel variant="in">
                <InputText id="name" v-model="editableName" :invalid="isNameExist" />
                <label for="name">Nom du plan d'entrainement</label>
              </FloatLabel>
              <Message v-if="isNameExist" severity="error" variant="simple">
                Ce nom de plan d'entrainement existe déjà. Veuillez en choisir un autre.
              </Message>
            </div>
            <div>
              <Button :text="!showWorkoutModels" icon="fa-solid fa-book-bookmark" label="Bibliothèque de séances"
                @click="handleShowModels" />
            </div>
          </div>
        </template>
        <template #content>
          <div class="w-full h-full flex">
            <div class="flex-1 overflow-auto p-5">
              <TrainingPlanWeek v-for="tw in weeks" :key="tw.weekNumber" :trainingWeek="tw" />
            </div>
            <AddWorkout />
            <WorkoutModels />
            <WorkoutDetails />
          </div>
        </template>
        <template #footer>
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
import { useStores } from '@/ui/composables/useStores';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanParams } from '@/ui/composables/useTrainingPlanParams';
import { useTrainingPlans } from '@/ui/composables/useTrainingPlans';
import { Breadcrumb, Button, Card, InputText } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import AddWorkout from './AddWorkout.vue';
import TrainingPlanEllipsisMenu from './TrainingPlanEllipsisMenu.vue';
import TrainingPlanWeek from './TrainingPlanWeek.vue';
import WorkoutDetails from './WorkoutDetails.vue';
import WorkoutModels from './WorkoutModels.vue';

const editing = ref(false);
const editableName = ref('');
const props = defineProps<{ id: string }>();
const stores = useStores();
const { showWorkoutModels, handleShowWorkoutModels, handleCloseWorkoutModels } = useTrainingPlanParams();
const { init, addNewWeek, updateName, id, name, weeks } = useTrainingPlan();
const { isTrainingPlanNameExist } = useTrainingPlans();

const isNameExist = computed(() => {
  return isTrainingPlanNameExist(editableName.value)
});

const isButtonDisabled = computed(() => {
  return isNameExist.value || !editableName.value
})

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

const startEditing = () => {
  if (!id.value) return;
  editing.value = true;
  editableName.value = name.value;
};


const cancelEdit = () => {
  editing.value = false;
  editableName.value = name.value;
};

const saveEdit = async () => {
  if (!id.value) return;
  updateName(editableName.value);
  editing.value = false;
};

onMounted(() => {
  initComposables();
});

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
