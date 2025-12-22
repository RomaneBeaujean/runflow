<template>
  <div class="p-8 h-full w-full overflow-y-auto">
    <div class="flex gap-1 flex-col md:flex-row">
      <div
        class="title-font text-4xl whitespace-nowrap flex justify-center mb-10 text-center flex-1"
      >
        Plans de course
      </div>
    </div>
    <div class="flex justify-center gap-5 items-center flex-col md:flex-row">
      <AddNewRace />

      <Button
        label="Importer un plan de course"
        rounded
        icon="pi pi-download"
        text
        @click="importFile"
      />
    </div>
    <RacesList />
  </div>
</template>

<script setup lang="ts">
import { useStores } from '@/ui/composables/useStores';
import AddNewRace from '@/ui/pages/races/race/AddNewRace.vue';
import RacesList from '@/ui/pages/races/races-list/RacesList.vue';
import { Button } from 'primevue';

const stores = useStores();

const importFile = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.runflow.json';
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    await stores.races_store.import(file);
  };
  input.click();
};
</script>

<style lang="scss" scoped></style>
