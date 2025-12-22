<template>
  <div class="flex flex-1 w-full justify-center">
    <template v-if="!showAddSeparator">
      <div class="flex justify-center">
        <Button
          icon="pi pi-plus-circle"
          text
          rounded
          size="small"
          @click="showAddSeparator = true"
        />
      </div>
    </template>
    <template v-else>
      <div class="flex flex-1 justify-center">
        <div class="max-w-[500px] flex-1">
          <Panel>
            <template #header>
              <span
                class="font-bold text-sm flex flex-1 justify-center text-primary-700"
                >Ajouter un séparateur</span
              >
            </template>
            <div class="flex flex-col gap-2">
              <div class="flex gap-2">
                <div class="flex flex-1 flex-col gap-2 items-center">
                  <div class="text-xs font-semibold">Distance (km)</div>
                  <InputDistance
                    :distance="newSeparatorDistance"
                    @update="(distance) => (newSeparatorDistance = distance)"
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
                  :disabled="isDisabled"
                  @click="save"
                />
                <Button
                  size="small"
                  label="Annuler"
                  icon="pi pi-times"
                  severity="secondary"
                  @click="cancel"
                />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { Separator } from '@/types/entities/Separator';
import InputDistance from '@/ui/components/inputs/InputDistance.vue';
import { useRace } from '@/ui/composables/useRace';
import { Button, Divider, Panel, ToggleSwitch } from 'primevue';
import { computed, ref } from 'vue';

const props = defineProps<{ initialdistance?: number }>();

const { addSeparator, totalDistance } = useRace();
const showAddSeparator = ref(false);
const newSeparatorDistance = ref(props.initialdistance || 0);
const newSeparatorRefuel = ref(false);

const isDisabled = computed(() => {
  const isValid =
    newSeparatorDistance.value > 0 &&
    newSeparatorDistance.value < totalDistance.value;

  return !isValid;
});

const save = () => {
  const separator: Separator = {
    distance: newSeparatorDistance.value,
    refuel: newSeparatorRefuel.value,
    stopDuration: null,
    timeBarrier: null,
  };
  addSeparator(separator);
  cancel();
};

const cancel = () => {
  showAddSeparator.value = false;
  newSeparatorDistance.value = props.initialdistance;
  newSeparatorRefuel.value = false;
};
</script>
