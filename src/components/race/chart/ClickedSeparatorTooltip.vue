<template>
  <div
    v-if="clickedSeparatorPosition"
    :style="{
      position: 'absolute',
      left: clickedSeparatorPosition.left,
      top: clickedSeparatorPosition.top,
      transform: 'translate(-50%, -50%)',
    }"
  >
    <div class="mt-12 bg-white rounded-md">
      <Button
        icon="pi pi-trash"
        label="Supprimer"
        class="w-full"
        size="small"
        severity="danger"
        text
        @click="handleDeleteSeparator"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRace } from '@/composables/useRace';
import useRaceChartInteraction from '@/composables/useRaceChartInteraction';
import { Button } from 'primevue';
const { clickedSeparatorPosition, clickedSeparator, closeTooltip } =
  useRaceChartInteraction();
const { deleteSeparator } = useRace();

const handleDeleteSeparator = () => {
  deleteSeparator(clickedSeparator.value.distance);
  closeTooltip();
};
</script>

<style scoped></style>
