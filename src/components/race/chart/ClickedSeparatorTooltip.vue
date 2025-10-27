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
import useRaceChartClick from '@/composables/Race/useChartClick';
import { useRace } from '@/composables/Race/useRace';
import { Button } from 'primevue';
const { clickedSeparatorPosition, clickedSeparator, closeTooltip } =
  useRaceChartClick();
const { deleteSeparator } = useRace();

const handleDeleteSeparator = () => {
  deleteSeparator(clickedSeparator.value.distance);
  closeTooltip();
};
</script>

<style scoped></style>
