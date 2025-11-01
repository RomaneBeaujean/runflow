<template>
  <template v-if="!showAddSeparator">
    <div class="relative z-10">
      <div class="absolute top-[-15px] left-[40px]">
        <Button
          icon="pi pi-plus-circle"
          text
          rounded
          size="small"
          @click="showAddSeparator = true"
        />
      </div>
    </div>
  </template>
  <template v-else>
    <div class="row relative h-[70px]">
      <div class="absolute top-0 left-0 bottom-0 right-0 p-2">
        <div class="flex gap-2">
          <!-- Distance -->
          <div class="flex flex-col gap-1 items-center mr-5">
            <span class="text-xs font-semibold">Distance</span>
            <InputDistance
              :distance="newSeparatorDistance"
              @update="updateDistance"
            />
          </div>

          <!-- Switch -->
          <div class="flex gap-2 items-center justify-center mr-5">
            <ToggleSwitch name="refuel" v-model="newSeparatorRefuel" />
            <label
              class="text-xs cursor-pointer"
              @click="newSeparatorRefuel = !newSeparatorRefuel"
              >Ravitaillement</label
            >
          </div>

          <!-- Boutons -->
          <div class="flex gap-2 items-center">
            <div>
              <Button
                size="small"
                label="Ajouter"
                icon="pi pi-check"
                :disabled="isDisabled"
                @click="save"
              />
            </div>
            <div>
              <Button
                size="small"
                label="Annuler"
                icon="pi pi-times"
                severity="secondary"
                @click="cancel"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
<script setup lang="ts">
import InputDistance from '@/components/race/inputs/InputDistance.vue';
import { useRace } from '@/composables/useRace';
import { Separator } from '@/types/entities/Separator';
import { Button, ToggleSwitch } from 'primevue';
import { computed, ref } from 'vue';

const props = defineProps<{ initialdistance?: number }>();

const { addSeparator, totalDistance } = useRace();
const showAddSeparator = ref(false);
const newSeparatorDistance = ref(props.initialdistance || null);
const newSeparatorRefuel = ref(false);

const isDisabled = computed(() => {
  const isValid =
    newSeparatorDistance.value > 0 &&
    newSeparatorDistance.value < totalDistance.value;

  return !isValid;
});

const updateDistance = (distance: number) => {
  newSeparatorDistance.value = distance;
};

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
<style lang="scss" scoped>
.row {
  border-bottom: 1px solid #ddd;
}

@media (max-width: 1200px) {
  .cell {
    padding: 4px;
  }
}

.xsmall {
  font-size: 10px;
}
</style>
