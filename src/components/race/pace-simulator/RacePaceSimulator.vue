<template>
  <Button
    label="Simulateur d'allures"
    icon="pi pi-android"
    @click="show = true"
  />

  <Dialog v-model:visible="show" modal class="w-[80%] h-4xl">
    <template #header>
      <span class="font-bold text-xl">
        Simulateur des allures ajustées à la pente
      </span>
    </template>
    <div class="flex flex-col gap-2" v-if="show">
      <PaceSimulator :parsedFile="parsedFile" v-model="newSplits" />
    </div>
    <template #footer>
      <div>
        <Button
          label="Fermer"
          icon="pi pi-times"
          variant="outlined"
          size="small"
          severity="secondary"
          @click="close"
        />
      </div>
      <div>
        <Button
          size="small"
          icon="pi pi-check"
          variant="outlined"
          label="Appliquer les allures"
          @click="applyAndClose"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import PaceSimulator from '@/components/race/PaceSimulator.vue';
import { useRace } from '@/composables/useRace';
import { recomputeSplits } from '@/lib/Splits';
import { Separator } from '@/types/entities/Separator';
import { Split } from '@/types/Split';
import { Button, Dialog } from 'primevue';
import { ref } from 'vue';

const { totalDistance, separators, splits, parsedFile } = useRace();
const show = ref(false);
const newSplits = ref<Split[]>([]);
const averagePace = ref<string>('');

const close = () => {
  show.value = false;
};

const applyAndClose = () => {
  const oldSeparators = separators.value.map((el) => el.distance);
  const newSeparators = newSplits.value
    .map((el) => el.endDistance)
    .filter((el) => !oldSeparators.includes(el))
    .map((el) => new Separator({ distance: el }));

  const mergedSeparators = [...separators.value, ...newSeparators].sort(
    (a, b) => a.distance - b.distance
  );

  splits.value = recomputeSplits({
    separators: mergedSeparators.map((it) => it.distance),
    oldSplits: newSplits.value,
    totalDistance: totalDistance.value,
    averagePace: averagePace.value,
  });

  separators.value = mergedSeparators;

  close();
};
</script>

<style lang="scss"></style>
