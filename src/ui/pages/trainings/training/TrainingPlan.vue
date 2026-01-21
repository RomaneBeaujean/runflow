<template>
  <div v-if="id" id="training" class="p-5 flex flex-col w-full h-full">
    <div id="breadcrumb">
      <Breadcrumb :model="items" class="text-sm"></Breadcrumb>
    </div>
    <div id="card" class="flex-1 min-h-0">
      <Card class="training-card w-full h-full relative">
        <template #title>
          <div class="flex justify-between items-center">
            <div>
              {{ name }}
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
import { Breadcrumb, Button, Card } from 'primevue';
import type { MenuItem } from 'primevue/menuitem';
import { onMounted, ref, watch } from 'vue';
import AddWorkout from './AddWorkout.vue';
import TrainingPlanWeek from './TrainingPlanWeek.vue';
import WorkoutDetails from './WorkoutDetails.vue';
import WorkoutModels from './WorkoutModels.vue';

const props = defineProps<{ id: string }>();
const stores = useStores();
const items = ref<MenuItem[]>([]);
const { showWorkoutModels, handleShowWorkoutModels, handleCloseWorkoutModels } = useTrainingPlanParams();
const { init, addNewWeek, name, weeks } = useTrainingPlan();

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

onMounted(() => {
  initComposables();
  if (!props.id) return;
  items.value = [
    { label: "Plans d'entrainement", url: '/trainings' },
    { label: name.value, disabled: true },
  ];
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
