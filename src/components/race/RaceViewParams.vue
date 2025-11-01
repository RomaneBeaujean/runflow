<template>
  <Button icon="pi pi-cog" rounded text @click="opened = true"></Button>
  <Drawer v-model:visible="opened" header="Paramètres" position="right">
    <div class="flex flex-col flex-1 p-5 gap-2 max-w-[300px]">
      <div class="flex items-center gap-2">
        <ToggleSwitch v-model="sticky" />
        <div
          class="text-xs cursor-pointer font-semibold text-primary-800"
          @click="sticky = !sticky"
        >
          Activer l'ancrage du graphique
        </div>
      </div>
      <div class="flex items-center gap-2">
        <ToggleSwitch v-model="editableMode" />
        <div
          class="text-xs cursor-pointer font-semibold text-primary-800"
          @click="editableMode = !editableMode"
        >
          Activer l'édition des splits
        </div>
      </div>
      <div class="flex items-center gap-2">
        <ToggleSwitch v-model="slopeVisual" />
        <div
          class="text-xs cursor-pointer font-semibold text-primary-800"
          @click="slopeVisual = !slopeVisual"
        >
          Colorer la courbe (% pente)
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { useRaceFilters } from '@/composables/useRaceFilters';
import { Button, Drawer, ToggleSwitch } from 'primevue';
import { ref } from 'vue';

const opened = ref(false);
const { sticky, editableMode, slopeVisual } = useRaceFilters();
</script>

<style scoped lang="scss"></style>
