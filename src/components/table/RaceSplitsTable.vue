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
    <Column header="Distance">
      <template #body="{ data }">
        <div v-if="data.refuel" class="flex flex-col items-start">
          <Tag
            :value="data.distance + ' km'"
            style="background-color: #f5d0fe; color: #c026d3"
            class="inline-block mb-2"
          />
          <Tag
            value="Ravitaillement"
            style="background-color: #f5d0fe; color: #c026d3"
            class="inline-block"
          />
        </div>

        <div v-else>
          <Tag severity="info" :value="data.distance + ' km'" />
        </div>
      </template>
      <template #editor="{ data }">
        <InputDistance
          :distance="data.distance"
          v-if="data.distance !== 0 && data.distance !== totalDistance"
          @update="({ distance }) => (data.distance = distance)"
        />
        <Tag v-else severity="info" :value="data.distance + ' km'" />
      </template>
    </Column>

    <Column header="Dénivelé cumulé (m)">
      <template #body="{ data }">
        <span>
          {{ data.cumulElevation }}
        </span>
      </template>
    </Column>

    <Column header="Longueur du split (km)">
      <template #body="{ data }">
        <span>
          {{ data.splitDistance }}
        </span>
      </template>
    </Column>

    <Column header="Dénivelé du split (m)">
      <template #body="{ data }">
        <span>
          {{ data.splitElevation }}
        </span>
      </template>
    </Column>

    <Column header="Allure du split (min/km) - Durée du split (h)">
      <template #body="{ data }">
        <div
          class="flex items-center space-x-2 w-full"
          v-if="data.distance !== 0"
        >
          <div class="flex-1 p-2 mr-8">
            {{ data.splitPace || '—' }}
          </div>
          <div class="flex-1 p-2">
            {{ minutesToFormattedDuration(data.splitDuration) || '—' }}
          </div>
        </div>
      </template>
      <template #editor="{ data }">
        <InputPaceDuration
          v-if="data.distance !== 0"
          :pace="data.splitPace"
          :distance="data.splitDistance"
          @update="({ pace }) => (data.splitPace = pace)"
        />
      </template>
    </Column>

    <Column header="Temps d'arrêt">
      <template #body="{ data }">
        <span v-if="data.refuel">
          {{ minutesToFormattedDuration(data.stopDuration || 0) }}
        </span>
      </template>
      <template #editor="{ data }">
        <InputRefuelStopDuration
          v-if="data.refuel"
          :duration="data.stopDuration || 0"
          @update="({ duration }) => (data.duration = duration)"
        />
      </template>
    </Column>

    <Column header="Durée totale">
      <template #body="{ data }">
        <span>
          {{ minutesToFormattedDuration(data.cumulDuration) }}
        </span>
      </template>
    </Column>

    <Column header="Barrière horraire">
      <template #body="{ data }">
        <span v-if="data.timeBarrier">
          <Tag :severity="isTimeBarrierOk(data) ? 'danger' : 'success'">
            {{ minutesToFormattedDuration(data.timeBarrier) }}
          </Tag>
        </span>
      </template>
      <template #editor="{ data }">
        <InputDuration
          :duration="data.timeBarrier || 0"
          v-if="data.distance !== 0"
          @update="({ duration }) => (data.timeBarrier = duration)"
        />
      </template>
    </Column>

    <Column
      :rowEditor="true"
      style="width: 24px"
      bodyStyle="text-align:center"
    ></Column>

    <Column style="width: 24px">
      <template #body="{ data }">
        <Button
          icon="pi pi-trash"
          size="small"
          text
          severity="danger"
          :disabled="data.distance === 0 || data.distance === totalDistance"
          @click="deleteSeparator(data.distance)"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { useGpxMetrics } from '@/composables/useGpxMetrics';
import { useRace } from '@/composables/useRace';
import { minutesToFormattedDuration } from '@/lib/time';
import { Separator } from '@/types/Separator';
import { Button, Column, DataTable, Tag } from 'primevue';
import { computed, ref } from 'vue';
import InputDistance from './InputDistance.vue';
import InputDuration from './InputDuration.vue';
import InputPaceDuration from './InputPaceDuration.vue';
import InputRefuelStopDuration from './InputRefuelStopDuration.vue';

const {
  race,
  splits,
  separators,
  totalDistance,
  deleteSeparator,
  updateSplitPace,
  updateSeparator,
} = useRace();

const {
  getCumulElevationToDistance,
  getCumulDurationToDistance,
  getSplitDistance,
  getSplitDuration,
  getSplitElevation,
} = useGpxMetrics();

const editingRows = ref<any[]>([]);

interface RowItem {
  id: string;
  refuel: boolean;

  distance: number;
  cumulElevation: number;
  cumulDuration: number;

  timeBarrier: number;

  splitDistance: number;
  splitElevation: number;
  splitPace: string;
  splitDuration: number;
}

const isTimeBarrierOk = (data: RowItem) => {
  const distance = data.distance;
  const cumulDuration = getCumulDurationToDistance(distance);
  const timeBarrier = data.timeBarrier;
  return timeBarrier < cumulDuration;
};

const rowItems = computed((): RowItem[] => {
  const firstRow = {
    id: `row-0`,
    refuel: false,
    distance: 0,
    timeBarrier: null,
    cumulDuration: 0,
    cumulElevation: 0,
    splitDistance: 0,
    splitDuration: 0,
    splitElevation: 0,
    splitPace: null,
  };

  const rows = separators.value.map((separator: Separator) => {
    const split = splits.value.find(
      (s) => s.endDistance === separator.distance
    );

    return {
      id: `row-${separator.distance}`,
      refuel: separator.refuel,
      distance: separator.distance,
      timeBarrier: separator.timeBarrier || null,
      cumulDuration: getCumulDurationToDistance(separator.distance),
      cumulElevation: getCumulElevationToDistance(separator.distance),
      splitDistance: getSplitDistance(split),
      splitDuration: getSplitDuration(split),
      splitElevation: getSplitElevation(split),
      splitPace: split.pace,
    };
  });

  return [firstRow, ...rows];
});

const onRowEditSave = (event: any) => {
  let { newData, index } = event;
  const oldData = rowItems.value[index];
  const oldSeparator = separators.value.find(
    (el) => el.distance === oldData.distance
  );
  const split = splits.value.find((el) => el.endDistance === oldData.distance);
  const newSeparator = {
    ...oldSeparator,
    distance: newData.distance,
    stopDuration: newData.stopDuration,
    timeBarrier: newData.timeBarrier,
  };

  if (JSON.stringify(newSeparator) !== JSON.stringify(oldSeparator)) {
    updateSeparator(oldSeparator, newSeparator);
  }

  if (oldData.splitPace !== newData.splitPace && split) {
    updateSplitPace(split, newData.splitPace);
  }
};
</script>
