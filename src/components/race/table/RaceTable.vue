<template>
  <div ref="tableContainer">
    <DataTable
      v-if="race"
      :value="TableRowItems"
      id="race-table"
      dataKey="id"
      editMode="row"
      selectionMode="single"
      v-model:editingRows="editingRows"
      @row-edit-save="onRowEditSave"
      @row-click="setTableClickedRow"
      rowHover
      :rowClass="getRowClass"
    >
      <Column header="Split" style="width: 14px">
        <template #body="{ data }">
          <span v-if="data.distance !== 0" class="text-xs">
            #{{ data.index }}
          </span>
        </template>
      </Column>

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

      <Column header="% moyen pente">
        <template #body="{ data }">
          <SlopeTag
            :percent="data.splitSlopePercent"
            v-if="data.distance !== 0"
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
            :reference="TableRowItems[0].time"
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
              <span
                >Heure: {{ dateToFormattedTime(data.timeBarrierTime) }}
              </span>
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
        style="white-space: nowrap; text-align: center"
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
  </div>
</template>

<script setup lang="ts">
import InputDistance from '@/components/race/inputs/InputDistance.vue';
import InputDuration from '@/components/race/inputs/InputDuration.vue';
import InputPaceDuration from '@/components/race/inputs/InputPaceDuration.vue';
import InputRefuelStopDuration from '@/components/race/inputs/InputRefuelStopDuration.vue';
import InputTime from '@/components/race/inputs/InputTime.vue';
import { useGpxMetrics } from '@/composables/useGpxMetrics';
import { useRace } from '@/composables/useRace';
import useRaceHoveredSplit from '@/composables/useRaceHoveredSplit';
import {
  dateToFormattedTime,
  minutesToFormattedDuration,
  parseDate,
} from '@/lib/time';
import { Separator } from '@/types/Separator';
import { TableRowItem } from '@/types/TableRowItem';
import { Button, Column, DataTable, Tag } from 'primevue';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import SlopeTag from '../SlopeTag.vue';

const {
  deleteSeparator,
  updateRaceStartTime,
  updateSeparator,
  updateSplitPace,
  totalDistance,
  startTime,
  splits,
  race,
  separators,
} = useRace();

const {
  getCumulElevationToDistance,
  getCumulDurationToDistance,
  getCumulNegativeElevationToDistance,
  getSplitDistance,
  getSplitNegativeElevation,
  getSplitSlopePercent,
  getSplitDuration,
  getSplitElevation,
} = useGpxMetrics();

const {
  setTableClickedRow,
  listenTableMouseEnter,
  removeListeners,
  hoveredSplit,
} = useRaceHoveredSplit();
const tableContainer = ref<HTMLElement | null>(null);
const editingRows = ref<any[]>([]);

const getRowClass = (rowData: TableRowItem): string => {
  return [
    'race-table-row',
    `distance-${rowData.distance}`,
    rowData.hovered && rowData.distance !== 0 ? 'hovered-row' : '',
  ].join(' ');
};

const isTimeBarrierOk = (data: TableRowItem) => {
  const distance = data.distance;
  const cumulDuration = getCumulDurationToDistance(distance);
  const timeBarrier = data.timeBarrier;
  return timeBarrier < cumulDuration;
};

const TableRowItems = computed((): TableRowItem[] => {
  const firstRow = {
    id: `row-0`,
    index: 0,
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
    splitSlopePercent: null,
    time: parseDate(startTime.value),
    hovered: false,
  };

  const rows = separators.value.map((separator: Separator, index: number) => {
    const split = splits.value.find(
      (s) => s.endDistance === separator.distance
    );

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
      index: index + 1,
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
      splitSlopePercent: getSplitSlopePercent(split).major,
      splitPace: split.pace,
      time,
      timeBarrierTime,
      hovered: hoveredSplit.value?.endDistance === separator.distance,
    };
  });

  return [firstRow, ...rows];
});

onMounted(() => {
  listenTableMouseEnter();
});

onBeforeUnmount(() => {
  removeListeners();
});

const onRowEditSave = (event: any) => {
  let { newData, index } = event;

  const oldData = TableRowItems.value[index];
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
#race-table {
  background-color: white;
}

#race-table .p-datatable-tbody > tr:hover,
#race-table .hovered-row {
  background-color: #ffedd4 !important;
}

#race-table thead {
  position: sticky;
  top: 300px;
  height: auto;
  z-index: 30;
}

#race-table .p-datatable-table-container {
  overflow-x: unset !important;
  overflow-y: unset !important;
}

:deep(input) {
  max-width: 100%;
}
</style>
