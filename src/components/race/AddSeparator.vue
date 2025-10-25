<template>
  <template v-if="!showAddSeparator">
    <div class="flex justify-center">
      <Button
        size="small"
        label="Ajouter un séparateur"
        text
        icon="pi pi-plus"
        @click="showAddSeparator = true"
      />
    </div>
  </template>
  <template v-else>
    <div class="flex justify-center mb-3 mt-3">
      <div class="max-w-[500px] flex-1">
        <Panel>
          <template #header>
            <span class="font-bold text-sm">Ajouter un séparateur</span>
          </template>
          <div class="flex flex-col gap-2">
            <div class="flex gap-2">
              <div class="flex flex-1 flex-col gap-2 items-center">
                <div class="text-xs font-semibold">Distance</div>
                <InputDistance
                  :distance="newSeparatorDistance"
                  @update="({ distance }) => (newSeparatorDistance = distance)"
                />
              </div>
              <Divider layout="vertical" />
              <div class="flex flex-1 flex-col items-center justify-center">
                <div class="flex flex-wrap gap-2 items-center justify-center">
                  <ToggleSwitch name="refuel" v-model="newSeparatorRefuel" />
                  <label
                    class="text-xs cursor-pointer"
                    @click="newSeparatorRefuel = !newSeparatorRefuel"
                    >Ravitaillement</label
                  >
                </div>
              </div>
            </div>
            <div class="flex gap-2 justify-center mt-2">
              <Button
                size="small"
                label="Ajouter"
                icon="pi pi-check"
                text
                @click="addSeparatorOnDistance"
              />
              <Button
                size="small"
                label="Annuler"
                icon="pi pi-times"
                text
                @click="closeAddSeparator"
              />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  </template>
</template>
<script setup lang="ts">
import InputDistance from '@/components/race/inputs/InputDistance.vue';
import { useRace } from '@/composables/useRace';
import { Separator } from '@/types/entities/Separator';
import { Button, Divider, Panel, ToggleSwitch } from 'primevue';
import { ref } from 'vue';

const showAddSeparator = ref(false);
const newSeparatorDistance = ref(0);
const newSeparatorRefuel = ref(false);
const { addSeparator } = useRace();

const addSeparatorOnDistance = () => {
  const separator: Separator = {
    distance: newSeparatorDistance.value,
    refuel: newSeparatorRefuel.value,
    stopDuration: null,
    timeBarrier: null,
  };
  addSeparator(separator);
  closeAddSeparator();
};

const closeAddSeparator = () => {
  showAddSeparator.value = false;
  newSeparatorDistance.value = 0;
  newSeparatorRefuel.value = false;
};
</script>
