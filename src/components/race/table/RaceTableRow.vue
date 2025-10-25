<template>
  <div class="cell w-[24px] font-semibold">
    <span v-if="isNotFirstLine" class="text-xs"> #{{ row.index }} </span>
    <span v-else class="text-xs"> Départ </span>
  </div>
  <div class="cell w-[24px]">
    <span v-if="row.refuel && !edition">
      <ColorTag color="pink">Ravitaillement</ColorTag>
    </span>
    <template v-if="isNotFirstLine && edition">
      <div class="flex flex-wrap gap-2 items-center justify-center">
        <ToggleSwitch
          :id="'refuel' + row.id"
          name="refuel"
          v-model="newRowData.refuel"
        />
        <label
          :for="'refuel' + row.id"
          class="text-xs cursor-pointer"
          @click="newRowData.refuel = !newRowData.refuel"
          >Ravitaillement</label
        >
      </div>
    </template>
  </div>
  <div class="cell font-semibold whitespace-nowrap border-l-1 border-gray-200">
    <template v-if="!edition">
      {{ row.distance }} <span class="xsmall">km</span>
    </template>
    <template
      v-if="edition && isNotFirstLine && row.distance !== totalDistance"
    >
      <InputDistance :distance="row.distance" @update="updateDistance" />
    </template>
  </div>
  <div class="cell">
    <div
      v-if="isNotFirstLine"
      class="flex flex-wrap flex-col md:flex-row gap-1 justify-center items-center"
    >
      <ColorTag class="mr-2">
        <span class="xsmall">+</span>{{ row.cumulElevation }}
        <span class="xsmall">m</span>
      </ColorTag>
      <ColorTag>
        <span class="xsmall">-</span>{{ row.cumulNegativeElevation }}
        <span class="xsmall">m</span>
      </ColorTag>
    </div>
  </div>
  <div class="cell border-l-1 border-gray-200">
    <div v-if="isNotFirstLine">
      <ColorTag color="amber" class="font-semibold">
        {{ row.splitDistance }} <span class="xsmall">km</span>
      </ColorTag>
    </div>
  </div>
  <div class="cell">
    <div
      v-if="isNotFirstLine"
      class="flex flex-wrap flex-col md:flex-row gap-1 justify-center items-center"
    >
      <ColorTag class="mr-2" color="amber">
        <span class="xsmall">+</span> {{ row.splitElevation }}
        <span class="xsmall">m</span>
      </ColorTag>
      <ColorTag color="amber">
        <span class="xsmall">-</span> {{ row.splitNegativeElevation }}
        <span class="xsmall">m</span>
      </ColorTag>
    </div>
  </div>
  <div class="cell">
    <div v-if="isNotFirstLine">
      <SlopeTag :slope="row.splitSlopePercent">
        {{ row.splitSlopePercent }} <span class="xsmall">%</span>
      </SlopeTag>
    </div>
  </div>
  <div class="cell border-r-1 border-gray-200">
    <div
      v-if="isNotFirstLine && !edition"
      class="flex flex-wrap flex-col md:flex-row gap-1 justify-center items-center"
    >
      <ColorTag icon="pi pi-bolt" color="deep-purple" class="mr-2">
        {{ row.splitPace }}
        <span class="xsmall">min/km</span>
      </ColorTag>
      <ColorTag icon="pi pi-stopwatch" color="green">
        {{ minutesToFormattedDuration(row.splitDuration) }}
      </ColorTag>
    </div>
    <div
      v-if="isNotFirstLine && edition"
      class="flex flex-wrap flex-col md:flex-row gap-1 justify-center items-center"
    >
      <InputPaceDuration
        :pace="row.splitPace"
        :distance="row.splitDistance"
        @update="updatePace"
      />
    </div>
  </div>
  <div class="cell border-r-1 border-gray-200">
    <template v-if="row.refuel && isNotFirstLine && !edition">
      <ColorTag color="pink">
        {{ row.stopDuration }} <span class="xsmall">min</span>
      </ColorTag>
    </template>
    <template v-if="isNotFirstLine && edition && newRowData.refuel">
      <InputRefuelStopDuration
        :duration="newRowData.stopDuration"
        @update="updateStopDuration"
      />
    </template>
  </div>
  <div class="cell border-r-1 border-gray-200">
    <div class="w-[70px] inline-block">
      <template v-if="isNotFirstLine || (!isNotFirstLine && !edition)">
        <ColorTag
          icon="pi pi-clock"
          color="primary"
          class="mb-2"
          v-if="row.time"
        >
          {{ dateToFormattedTime(row.time) }}
        </ColorTag>
        <ColorTag icon="pi pi-stopwatch" color="green" v-if="isNotFirstLine">
          {{ minutesToFormattedDuration(row.cumulDuration) }}
        </ColorTag>
      </template>
      <template v-if="edition && !isNotFirstLine">
        <InputTime
          :time="row.time"
          :reference="row.time"
          size="small"
          @update="updateStartTime"
        />
      </template>
    </div>
  </div>
  <div class="cell">
    <div v-if="isNotFirstLine" class="w-[70px] inline-block">
      <template v-if="!isNotFirstLine || (isNotFirstLine && !edition)">
        <ColorTag
          v-if="row.timeBarrier"
          icon="pi pi-clock"
          :color="row.timeBarrierValid ? 'bright-green' : 'red'"
          class="mb-2"
        >
          {{ dateToFormattedTime(row.timeBarrier) }}
        </ColorTag>
        <ColorTag
          v-if="row.timeBarrier"
          icon="pi pi-stopwatch"
          :color="row.timeBarrierValid ? 'bright-green' : 'red'"
        >
          {{ minutesToFormattedDuration(row.timeBarrierDuration) }}
        </ColorTag>
      </template>
      <template v-if="isNotFirstLine && edition">
        <InputTime
          :time="row.timeBarrier"
          :reference="race.startTime"
          size="small"
          @update="updateTimeBarrier"
        />
      </template>
    </div>
  </div>
  <div class="cell border-l-1 border-gray-200">
    <div v-if="!edition" class="flex flex-nowrap">
      <Button
        icon="pi pi-pencil"
        size="small"
        text
        class="mr-2"
        @click="editRow"
      />
      <Button
        icon="pi pi-trash"
        size="small"
        text
        :disabled="row.distance === 0 || row.distance === totalDistance"
      />
    </div>
    <template v-else>
      <Button
        icon="pi pi-check"
        size="small"
        text
        class="mr-2"
        @click="saveRow"
      />
      <Button icon="pi pi-times" size="small" text @click="uneditRow" />
    </template>
  </div>
</template>

<script setup lang="ts">
import ColorTag from '@/components/ColorTag.vue';
import { useRace } from '@/composables/useRace';
import { dateToFormattedTime, minutesToFormattedDuration } from '@/lib/time';
import { TableRowItem } from '@/types/TableRowItem';
import { Button, ToggleSwitch } from 'primevue';
import { computed, ref, watch } from 'vue';
import SlopeTag from '../SlopeTag.vue';
import InputDistance from '../inputs/InputDistance.vue';
import InputPaceDuration from '../inputs/InputPaceDuration.vue';
import InputRefuelStopDuration from '../inputs/InputRefuelStopDuration.vue';
import InputTime from '../inputs/InputTime.vue';

const props = defineProps<{ row: TableRowItem }>();
const {
  totalDistance,
  updateSplitPace,
  updateSeparator,
  updateRaceStartTime,
  separators,
  race,
} = useRace();
const edition = ref<boolean>(false);
const newRowData = ref<{
  refuel: boolean;
  pace: string;
  distance: number;
  stopDuration: number;
  timeBarrier: Date;
  startTime: Date;
}>({
  refuel: props.row.refuel,
  pace: props.row.splitPace,
  distance: props.row.distance,
  stopDuration: props.row.stopDuration,
  timeBarrier: props.row.timeBarrier,
  startTime: props.row.time,
});

const isNotFirstLine = computed(() => {
  return props.row.index !== 0;
});

const separator = computed(() => {
  return separators.value.find((el) => el.distance === props.row.distance);
});

const editRow = () => {
  edition.value = true;
};

const saveRow = () => {
  const { pace, distance, stopDuration, timeBarrier, startTime, refuel } =
    newRowData.value;

  if (props.row.distance === 0) {
    if (startTime !== props.row.time) updateRaceStartTime(startTime);
    uneditRow();
    return;
  }

  const newSeparator = {
    ...separator.value,
    distance,
    stopDuration,
    timeBarrier,
    refuel,
  };
  if (props.row.splitPace !== pace) updateSplitPace(props.row.split, pace);
  if (separator.value !== newSeparator)
    updateSeparator(separator.value, newSeparator);

  uneditRow();
};

const uneditRow = () => {
  edition.value = false;
  newRowData.value = {
    refuel: props.row.refuel,
    pace: props.row.splitPace,
    distance: props.row.distance,
    stopDuration: props.row.stopDuration,
    timeBarrier: props.row.timeBarrier,
    startTime: props.row.time,
  };
};

const updatePace = (data: { pace: string }) => {
  if (data.pace?.match(/^\d{1,2}:\d{2}/)) {
    newRowData.value.pace = data.pace;
  }
};

const updateDistance = (data: { distance: number }) => {
  newRowData.value.distance = data.distance;
};

const updateTimeBarrier = (data: { time: Date }) => {
  newRowData.value.timeBarrier = data.time;
};

const updateStopDuration = (data: { duration: number }) => {
  newRowData.value.stopDuration = data.duration;
};

const updateStartTime = (data: { time: Date }) => {
  newRowData.value.startTime = data.time;
};

watch(props, () => {
  uneditRow();
});

watch(
  () => newRowData.value.refuel,
  (newValue) => {
    if (!newValue) {
      updateStopDuration({ duration: 0 });
    }
  }
);
</script>

<style lang="scss" scoped>
.cell {
  display: table-cell;
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
  vertical-align: middle;
  text-align: center;
  font-size: 14px;
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
