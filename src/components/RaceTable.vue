<template>
  <DataTable
    v-if="race"
    :value="rowItems"
    id="race-table"
    dataKey="id"
    editMode="row"
    selectionMode="single"
    v-model:editingRows="editingRows"
    @row-edit-save="onRowEditSave"
    rowHover
    :rowClass="getRowClass"
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

    <Column header="D+ cumulé">
      <template #body="{ data }">
        <Tag
          v-if="data.distance !== 0"
          :value="'+ ' + data.cumulElevation + ' m'"
          style="background-color: #e0cebe; color: #713f12"
          class="inline-block mb-2"
        />
      </template>
    </Column>

    <Column header="D- cumulé">
      <template #body="{ data }">
        <Tag
          v-if="data.distance !== 0"
          :value="'- ' + data.cumulNegativeElevation + ' m'"
          style="background-color: #e0cebe; color: #713f12"
          class="inline-block mb-2"
        />
      </template>
    </Column>

    <Column
      header="Longueur du split"
      headerStyle="border-left: 1px solid #e5e7eb;"
      bodyStyle="border-left: 1px solid #e5e7eb;"
    >
      <template #body="{ data }">
        <Tag
          v-if="data.distance !== 0"
          :value="data.splitDistance + ' km'"
          style="background-color: #fffbeb; color: #713f12"
          class="inline-block mb-2"
        />
      </template>
    </Column>

    <Column header="D+ split (m)">
      <template #body="{ data }">
        <Tag
          v-if="data.distance !== 0"
          :value="'+ ' + data.splitElevation + ' m'"
          style="background-color: #fffbeb; color: #713f12"
          class="inline-block mb-2"
        />
      </template>
    </Column>

    <Column header="D- split (m)">
      <template #body="{ data }">
        <Tag
          v-if="data.distance !== 0"
          :value="'- ' + data.splitNegativeElevation + ' m'"
          style="background-color: #fffbeb; color: #713f12"
          class="inline-block mb-2"
        />
      </template>
    </Column>

    <Column
      header="Allure du split / Durée du split"
      bodyStyle="border-right: 1px solid #e5e7eb;"
      headerStyle="border-right: 1px solid #e5e7eb;"
    >
      <template #body="{ data }">
        <div
          class="flex items-center space-x-2 w-full"
          v-if="data.distance !== 0"
        >
          <div class="flex-1 p-2 mr-8">
            <Tag
              style="background-color: #fffbeb; color: #713f12"
              class="inline-block mb-2"
            >
              {{ data.splitPace }} <small>min/km</small></Tag
            >
          </div>
          <div class="flex-1 p-2">
            <Tag
              :value="minutesToFormattedDuration(data.splitDuration)"
              style="background-color: #fffbeb; color: #713f12"
              class="inline-block mb-2"
            />
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

    <Column header="Temps d'arrêt" style="width: 150px">
      <template #body="{ data }">
        <Tag
          v-if="data.refuel"
          severity="warn"
          :value="data.stopDuration + ' minute(s)'"
        />
      </template>
      <template #editor="{ data }">
        <InputRefuelStopDuration
          v-if="data.refuel"
          :duration="data.stopDuration || 0"
          @update="({ duration }) => (data.stopDuration = duration)"
        />
      </template>
    </Column>

    <Column
      header="Durée totale"
      bodyStyle="border-right: 1px solid #e5e7eb;"
      headerStyle="border-right: 1px solid #e5e7eb;"
    >
      <template #body="{ data }">
        <Tag severity="secondary" v-if="data.distance !== 0">
          {{ minutesToFormattedDuration(data.cumulDuration) }}
        </Tag>
      </template>
    </Column>

    <Column
      header="Heure"
      bodyStyle="border-right: 1px solid #e5e7eb;"
      headerStyle="border-right: 1px solid #e5e7eb;"
    >
      <template #body="{ data }">
        <span v-if="data.time">
          <Tag severity="info">
            {{
              data.time.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            }}
          </Tag>
        </span>
      </template>
      <template #editor="{ data }">
        <InputTime
          v-if="data.distance === 0"
          :time="data.time"
          :reference="rowItems[0].time"
          size="small"
          @update="({ time }) => (data.time = time)"
        />
      </template>
    </Column>

    <Column
      header="Barrière horraire"
      bodyStyle="border-right: 1px solid #e5e7eb;"
      headerStyle="border-right: 1px solid #e5e7eb;"
    >
      <template #body="{ data }">
        <div
          v-if="data.timeBarrier"
          class="flex flex-wrap justify-center gap-1"
        >
          <Tag :severity="isTimeBarrierOk(data) ? 'danger' : 'success'">
            Durée: {{ minutesToFormattedDuration(data.timeBarrier) }}
          </Tag>
          <Tag
            v-if="data.timeBarrierTime"
            :severity="isTimeBarrierOk(data) ? 'danger' : 'success'"
          >
            <span>Heure: {{ dateToFormattedTime(data.timeBarrierTime) }} </span>
          </Tag>
        </div>
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
import useRaceHoveredSplit from '@/composables/useRaceHoveredSplit';
import {
  dateToFormattedTime,
  minutesToFormattedDuration,
  parseDate,
} from '@/lib/time';
import { Separator } from '@/types/Separator';
import { Button, Column, DataTable, Tag } from 'primevue';
import { computed, ref } from 'vue';
import InputDistance from './InputDistance.vue';
import InputDuration from './InputDuration.vue';
import InputPaceDuration from './InputPaceDuration.vue';
import InputRefuelStopDuration from './InputRefuelStopDuration.vue';
import InputTime from './InputTime.vue';

const {
  race,
  splits,
  startTime,
  separators,
  totalDistance,
  deleteSeparator,
  updateSplitPace,
  updateSeparator,
  updateRaceStartTime,
} = useRace();

const {
  getCumulElevationToDistance,
  getCumulDurationToDistance,
  getCumulNegativeElevationToDistance,
  getSplitDistance,
  getSplitNegativeElevation,
  getSplitDuration,
  getSplitElevation,
} = useGpxMetrics();

const { hoveredSplit } = useRaceHoveredSplit();

const editingRows = ref<any[]>([]);

interface RowItem {
  id: string;
  refuel: boolean;

  distance: number;
  cumulElevation: number;
  cumulDuration: number;
  cumulNegativeElevation: number;

  timeBarrier: number;
  timeBarrierTime: Date;

  splitDistance: number;
  splitElevation: number;
  splitPace: string;
  splitDuration: number;
  splitNegativeElevation: number;
  highlighted: boolean;

  time: Date | null;
}

const getRowClass = (rowData: RowItem) => {
  const hovered = hoveredSplit.value;
  if (!hovered) return '';
  return rowData.distance === hovered.startDistance ? 'highlight-row' : '';
};

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
    cumulNegativeElevation: 0,
    splitDistance: 0,
    splitDuration: 0,
    splitElevation: 0,
    splitNegativeElevation: 0,
    splitPace: null,
    timeBarrierTime: null,
    time: parseDate(startTime.value),
    highlighted: false,
  };

  const rows = separators.value.map((separator: Separator) => {
    const split = splits.value.find(
      (s) => s.endDistance === separator.distance
    );

    const isHighlighted =
      hoveredSplit.value?.startDistance === split.startDistance;

    const cumulDuration = getCumulDurationToDistance(separator.distance);

    const time = firstRow.time
      ? new Date(firstRow.time.getTime() + cumulDuration * 60 * 1000)
      : null;

    const timeBarrierTime =
      firstRow.time && separator.timeBarrier
        ? new Date(firstRow.time.getTime() + separator.timeBarrier * 60 * 1000)
        : null;

    return {
      id: `row-${separator.distance}`,
      refuel: separator.refuel,
      distance: separator.distance,
      timeBarrier: separator.timeBarrier || null,
      stopDuration: separator.stopDuration || 0,
      cumulDuration,
      cumulElevation: getCumulElevationToDistance(separator.distance),
      cumulNegativeElevation: getCumulNegativeElevationToDistance(
        separator.distance
      ),
      splitDistance: getSplitDistance(split),
      splitDuration: getSplitDuration(split),
      splitElevation: getSplitElevation(split),
      splitNegativeElevation: getSplitNegativeElevation(split),
      splitPace: split.pace,
      time,
      timeBarrierTime,
      highlighted: isHighlighted,
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

  if (newData.distance === 0 && newData.time) {
    updateRaceStartTime(newData.time);
    return;
  }

  if (JSON.stringify(newSeparator) !== JSON.stringify(oldSeparator)) {
    updateSeparator(oldSeparator, newSeparator);
  }

  if (oldData.splitPace !== newData.splitPace && split) {
    updateSplitPace(split, newData.splitPace);
  }
};
</script>

<style>
#race-table .p-datatable-tbody > tr:hover,
#race-table .highlight-row {
  background-color: #ece6e4 !important;
}

#race-table thead {
  position: sticky;
  top: 300px;
  background: yellow;
  height: auto;
  z-index: 30;
}

#race-table .p-datatable-table-container {
  overflow-x: unset !important;
  overflow-y: unset !important;
}

/* #race-table,
#race-table * {
  overflow: visible;
}

#race-table thead {
  position: sticky;
  top: 0;
  z-index: 30;
  background: white;
} */

:deep(input) {
  max-width: 100%;
}
</style>
