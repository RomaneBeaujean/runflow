<template>
  <DataTable
    v-if="race"
    :value="rowItems"
    dataKey="id"
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
        <Tag
          v-if="!data.refuel"
          severity="info"
          :value="data.split.startDistance + ' km'"
        />
        <Tag
          v-if="data.refuel"
          severity="info"
          :value="data.split.startDistance + ' km'"
          style="background-color: #f5d0fe; color: #c026d3"
        />
      </template>
      <template #editor="{ data }">
        <InputSeparator
          :split="data.split"
          :value="data.split.startDistance"
          @update="onSplitUpdate($event, data)"
        />
      </template>
    </Column>

    <Column field="endDistance" header="Fin">
      <template #body="{ data }">
        <Tag
          v-if="!data.refuel"
          severity="info"
          :value="data.split.endDistance + ' km'"
        />

        <Tag
          v-if="data.refuel"
          severity="info"
          value="Ravitaillement"
          style="background-color: #f5d0fe; color: #c026d3"
        />
      </template>
    </Column>

    <Column header="Longueur du split (km)">
      <template #body="{ data }">
        <span v-if="!data.refuel">
          {{
            roundOneNumber(data.split.endDistance - data.split.startDistance)
          }}
        </span>
      </template>
    </Column>

    <Column header="D+ (m)">
      <template #body="{ data }">
        <span v-if="!data.refuel">
          {{ getElevationFromSplit(data.split) }}
        </span>
      </template>
    </Column>

    <Column header="Cumul D+ (m)">
      <template #body="{ data }">
        <span v-if="!data.refuel">
          {{ getCumulElevationFromSplit(splits, data.split) }}
        </span>
      </template>
    </Column>

    <Column header="Allure (min/km) - Durée (h)">
      <template #body="{ data }">
        <div v-if="!data.refuel">
          <div class="flex items-center space-x-2 w-full" v-if="!data.refuel">
            <div class="flex-1 p-2 mr-8">
              {{ data.split.pace || '—' }}
            </div>
            <div class="flex-1 p-2">
              {{ getFormattedDurationFromSplit(data.split) || '—' }}
            </div>
          </div>
        </div>
      </template>
      <template #editor="{ data }">
        <InputPaceDuration
          v-if="!data.refuel"
          :split="data.split"
          @update="onSplitUpdate($event, data)"
        />
      </template>
    </Column>

    <Column header="Durée totale">
      <template #body="{ data }">
        <span v-if="data.refuel">
          {{ getCumulDurationToSeparator(splits, data.separator.distance) }}
        </span>
        <span v-else>
          {{ getCumulDurationFromSplit(splits, data.split) }}
        </span>
      </template>
    </Column>

    <Column
      :rowEditor="true"
      style="width: 10%; min-width: 8rem"
      bodyStyle="text-align:center"
    ></Column>

    <Column style="width: 10%; min-width: 8rem">
      <template #body="{ data }">
        <Button
          icon="pi pi-trash"
          size="small"
          text
          severity="danger"
          :disabled="data.startDistance === 0"
          @click="deleteSeparator(data.split.startDistance)"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { useGpxMetrics } from '@/composables/useGpxMetrics';
import { useRace } from '@/composables/useRace';
import { roundOneNumber } from '@/lib/utils';
import { Separator } from '@/types/Separator';
import { Split } from '@/types/Split';
import { Button, Column, DataTable, Tag } from 'primevue';
import { computed, ref } from 'vue';
import InputPaceDuration from './InputPaceDuration.vue';
import InputSeparator from './InputSeparator.vue';

const {
  race,
  separators,
  splits,
  deleteSeparator,
  updateSplitPace,
  updateSeparator,
} = useRace();
const {
  getElevationFromSplit,
  getCumulElevationFromSplit,
  getCumulDurationFromSplit,
  getCumulDurationToSeparator,
  getFormattedDurationFromSplit,
} = useGpxMetrics();

interface RowItem {
  refuel: boolean;
  split: Split;
  separator?: Separator;
}

const rowItems = computed((): RowItem[] => {
  return splits.value.reduce((items, split) => {
    const sep = separators.value.find(
      (el) => el.distance === split.startDistance
    );

    if (sep && sep.type === 'refuel') {
      return [
        ...items,
        {
          id: `refuel-${sep.distance}`,
          refuel: true,
          separator: sep,
          split,
        },
        {
          id: `split-${split.startDistance}`,
          refuel: false,
          split,
        },
      ];
    } else {
      return [
        ...items,
        {
          id: `split-${split.startDistance}`,
          refuel: false,
          split,
        },
      ];
    }
  }, [] as RowItem[]);
});

const editingRows = ref<any[]>([]);

const onSplitUpdate = (newSplit: Split, rowItem: RowItem) => {
  rowItem.split = { ...rowItem.split, ...newSplit };
};

const onRowEditSave = (event: any) => {
  let { newData, index } = event;
  const newSplit = newData.split;
  const oldSplit = rowItems.value[index].split;
  const separator = separators.value.find(
    (el) => el.distance === oldSplit.startDistance
  );
  if (oldSplit.startDistance !== newSplit.startDistance) {
    updateSeparator(oldSplit.startDistance, {
      ...separator,
      distance: newSplit.startDistance,
    });
  }
  if (oldSplit.pace !== newSplit.pace) {
    updateSplitPace(oldSplit, newSplit.pace);
  }
};
</script>
