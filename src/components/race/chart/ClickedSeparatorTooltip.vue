<template>
  <div
    v-if="clickedSeparatorPosition"
    :style="{
      position: 'absolute',
      left: clickedSeparatorPosition.left,
      top: clickedSeparatorPosition.top,
    }"
  >
    <div class="p-2 bg-white rounded-md shadow-2xl opacity-90 ml-2">
      <div class="flex flex-col gap-3">
        <Button
          icon="pi pi-cart-arrow-down"
          :text="!isRefuel"
          v-tooltip.bottom="
            isRefuel ? 'Enlever ravitaillement' : 'Définir ravitaillement'
          "
          @click="handleUpdateRefuel"
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          v-tooltip.bottom="'Supprimer'"
          @click="handleDeleteSeparator"
        />
        <Button
          icon="pi pi-times"
          @click="closeTooltip"
          text
          v-tooltip.bottom="'Fermer'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRace } from '@/composables/useRace';
import useRaceChartInteraction from '@/composables/useRaceChartInteraction';
import { Button } from 'primevue';
import { ref, watch } from 'vue';

const isRefuel = ref<boolean>(false);
const { clickedSeparatorPosition, clickedSeparator, closeTooltip } =
  useRaceChartInteraction();
const { deleteSeparator, updateSeparator } = useRace();

const handleUpdateRefuel = () => {
  isRefuel.value = !isRefuel.value;

  updateSeparator(clickedSeparator.value, {
    ...clickedSeparator.value,
    refuel: isRefuel.value,
  });

  closeTooltip();
};

const handleDeleteSeparator = () => {
  deleteSeparator(clickedSeparator.value.distance);
  closeTooltip();
};

watch(clickedSeparator, () => {
  if (clickedSeparator.value) {
    isRefuel.value = clickedSeparator.value.refuel;
  }
});
</script>

<style scoped></style>
