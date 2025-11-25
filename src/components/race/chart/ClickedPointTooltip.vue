<template>
  <div
    v-if="clickedPointPosition"
    :style="{
      position: 'absolute',
      left: clickedPointPosition.left,
      top: clickedPointPosition.top,
    }"
  >
    <i
      class="pi pi-circle-fill text-amber-500"
      style="transform: translate(-50%, -50%)"
    ></i>
    <div
      class="p-2 bg-white rounded-md shadow-md"
      style="transform: translate(-15px)"
    >
      <div class="flex flex-col gap-1">
        <Button
          label="Ajouter un séparateur"
          icon="pi pi-arrows-v"
          size="small"
          class="p-button-text w-full justify-start hover:bg-gray-100"
          @click="() => addSeparatorOnClickedPoint(false)"
        />
        <Button
          label="Ajouter un ravitaillement"
          icon="pi pi-shopping-cart"
          size="small"
          class="p-button-text w-full justify-start hover:bg-gray-100"
          @click="() => addSeparatorOnClickedPoint(true)"
        />
        <Button
          label="Fermer"
          size="small"
          class="p-button-text p-button-secondary w-full justify-start hover:bg-gray-200"
          @click="closeTooltip"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRace } from '@/composables/useRace';
import useRaceChartInteraction from '@/composables/useRaceChartInteraction';
import { Separator } from '@/types/entities/Separator';
import { Button } from 'primevue';

const { clickedPoint, clickedPointPosition, closeTooltip } =
  useRaceChartInteraction();

const { addSeparator } = useRace();

const addSeparatorOnClickedPoint = (refuel: boolean) => {
  const separator: Separator = {
    distance: clickedPoint.value.distance,
    refuel,
    stopDuration: null,
    timeBarrier: null,
  };
  addSeparator(separator);
  closeTooltip();
};
</script>

<style scoped></style>
