<template>
  <DataTable
    v-if="race"
    :value="splits"
    dataKey="startDistance"
    editMode="row"
    v-model:editingRows="editingRows"
    @row-edit-save="onRowEditSave"
    responsiveLayout="scroll"
    rowHover
    class="w-full"
  >
    <!-- Début -->
    <Column field="startDistance" header="Début">
      <template #body="{ data }">
        {{ data.startDistance }}
      </template>
      <template #editor="{ data }">
        <InputSeparator :split="data" @update="onSplitUpdate($event, data)" />
      </template>
    </Column>

    <!-- Fin -->
    <Column header="Fin">
      <template #body="{ data }">{{ data.endDistance }}</template>
    </Column>

    <!-- Distance -->
    <Column header="Distance (km)">
      <template #body="{ data }">
        {{ roundOneNumber(data.endDistance - data.startDistance) }}
      </template>
    </Column>

    <!-- D+ -->
    <Column header="D+ (m)">
      <template #body="{ data }">
        {{ getElevationFromSplit(data) }}
      </template>
    </Column>

    <!-- Cumul D+ -->
    <Column header="Cumul D+ (m)">
      <template #body="{ data }">
        {{ getCumulElevationFromSplit(splits, data) }}
      </template>
    </Column>

    <!-- Allure / Durée -->
    <Column header="Allure / Durée">
      <template #body="{ data }">
        <div class="flex items-center space-x-2 w-full">
          <div class="flex-1 p-2">
            {{ data.pace || '—' }}
          </div>
          <div class="flex-1 p-2">
            {{ getFormattedDurationFromSplit(data) || '—' }}
          </div>
        </div>
      </template>
      <template #editor="{ data }">
        <InputPaceDuration
          :split="data"
          @update="onSplitUpdate($event, data)"
        />
      </template>
    </Column>

    <!-- Cumul Duration -->
    <Column header="Durée totale">
      <template #body="{ data }">
        {{ getCumulDurationFromSplit(splits, data) }}
      </template>
    </Column>

    <!-- Actions -->
    <Column
      :rowEditor="true"
      style="width: 10%; min-width: 8rem"
      bodyStyle="text-align:center"
    ></Column>

    <Column>
      <template #body="{ data }">
        <Button
          icon="pi pi-trash"
          size="small"
          text
          severity="danger"
          :disabled="data.startDistance === 0"
          @click="deleteSeparator(data.startDistance)"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { useGpxMetrics } from '@/composables/useGpxMetrics';
import { useRace } from '@/composables/useRace';
import { roundOneNumber } from '@/lib/utils';
import { Split } from '@/types/Split';
import { Button, Column, DataTable } from 'primevue';
import { ref } from 'vue';
import InputPaceDuration from './InputPaceDuration.vue';
import InputSeparator from './InputSeparator.vue';

const { race, splits, deleteSeparator, updateSplitPace, updateSeparator } =
  useRace();
const {
  getElevationFromSplit,
  getCumulElevationFromSplit,
  getCumulDurationFromSplit,
  getFormattedDurationFromSplit,
} = useGpxMetrics();

const editingRows = ref<any[]>([]);

const onSplitUpdate = (newSplit: Split, oldSplit: Split) => {
  Object.assign(oldSplit, newSplit);
};

const onRowEditSave = (event: any) => {
  let { newData: newSplit, index } = event;
  const oldSplit = splits.value[index];
  if (oldSplit.startDistance !== newSplit.startDistance) {
    updateSeparator(oldSplit.startDistance, newSplit.startDistance);
  }
  if (oldSplit.pace !== newSplit.pace) {
    updateSplitPace(oldSplit, newSplit.pace);
  }
};
</script>
