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
      style="transform: translate(-50%)"
    >
      <div class="flex flex-col gap-1">
        <Button
          v-tooltip.bottom="'Ajouter séparateur'"
          icon="pi pi-arrows-v"
          text
          @click="() => addSeparatorOnClickedPoint(false)"
        />
        <Button
          v-tooltip.bottom="'Ajouter ravitaillement'"
          icon="pi pi-shopping-cart"
          text
          @click="() => addSeparatorOnClickedPoint(true)"
        />
        <Button
          icon="pi pi-times"
          text
          @click="closeTooltip"
          v-tooltip="'Fermer'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Separator } from '@/domain/types/Separator';
import { useRace } from '@/ui/composables/useRace';
import useRaceChartInteraction from '@/ui/composables/useRaceChartInteraction';
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
