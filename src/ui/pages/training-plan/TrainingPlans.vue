<template>
  <div class="p-8 h-full w-full overflow-y-auto">
    <div class="flex gap-1 flex-col md:flex-row">
      <div class="title-font text-4xl whitespace-nowrap flex justify-center mb-10 text-center flex-1">
        Plans d'entrainement
      </div>
    </div>
    <div class="flex justify-center gap-5 items-center flex-col md:flex-row">
      <AddNewTrainingPlan />

      <Button label="Importer un plan d'entrainement" rounded icon="pi pi-download" text @click="importFile" />
    </div>
    <TrainingsList />
  </div>
</template>

<script setup lang="ts">
import { useStores } from '@/ui/composables/useStores';
import { Button } from 'primevue';
import AddNewTrainingPlan from './AddNewTrainingPlan.vue';
import TrainingsList from './trainings-list/TrainingsList.vue';

const stores = useStores();

const importFile = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.tp.runflow.json';
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    await stores.training_plans_store.importTrainingPlan(file);
  };
  input.click();
};
</script>

<style lang="scss" scoped></style>
