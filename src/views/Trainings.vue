<template>
  <div class="p-8 h-full w-full overflow-y-auto">
    <div class="flex gap-1 flex-col md:flex-row">
      <div
        class="title-font text-4xl whitespace-nowrap flex justify-center mb-10 text-center flex-1"
      >
        Plans d'entrainement
      </div>
    </div>
    <div class="flex justify-center gap-5 items-center flex-col md:flex-row">
      <Button label="Créer un plan d'entrainement" icon="pi pi-plus" />

      <Button
        label="Importer un plan d'entrainement"
        rounded
        icon="pi pi-download"
        text
        @click="importFile"
      />
    </div>
    <!-- <RacesList /> -->
  </div>
</template>

<script setup lang="ts">
import { useStores } from '@/composables/useStores';
import { Button } from 'primevue';

const stores = useStores();

const importFile = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.runflow.json';
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    await stores.races.importRace(file);
  };
  input.click();
};
</script>

<style lang="scss" scoped></style>
