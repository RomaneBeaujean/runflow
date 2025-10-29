<template>
  <div class="cell w-[24px] font-semibold">
    <span v-if="isNotFirstLine" class="text-xs"> #{{ split.index }} </span>
    <span v-else class="text-xs"> Départ </span>
  </div>
  <div class="cell w-[24px]">
    <span v-if="split.refuel && !edition">
      <ColorTag color="pink">Ravitaillement</ColorTag>
    </span>
    <template v-if="isNotFirstLine && edition && isNotFirstLine">
      <div class="flex flex-wrap gap-2 items-center justify-center">
        <ToggleSwitch
          :id="'refuel' + split.id"
          name="refuel"
          v-model="newRowData.refuel"
        />
        <label
          :for="'refuel' + split.id"
          class="text-xs cursor-pointer"
          @click="newRowData.refuel = !newRowData.refuel"
          >Ravitaillement</label
        >
      </div>
    </template>
  </div>
  <div class="cell font-semibold whitespace-nowrap border-l-1 border-gray-200">
    <template v-if="!edition || !isNotLastLine || !isNotFirstLine">
      {{ split.distance }} <span class="xsmall">km</span>
    </template>
    <template v-if="edition && isNotFirstLine && isNotLastLine">
      <InputDistance :distance="split.distance" @update="updateDistance" />
    </template>
  </div>
  <div class="cell">
    <div
      v-if="isNotFirstLine"
      class="flex flex-wrap flex-col md:flex-row gap-1 justify-center items-center"
    >
      <ColorTag class="mr-2">
        <span class="xsmall">+</span>{{ split.cumulElevation }}
        <span class="xsmall">m</span>
      </ColorTag>
      <ColorTag>
        <span class="xsmall">-</span>{{ split.cumulNegativeElevation }}
        <span class="xsmall">m</span>
      </ColorTag>
    </div>
  </div>
  <div class="cell border-l-1 border-gray-200">
    <div v-if="isNotFirstLine">
      <ColorTag color="amber" class="font-semibold">
        {{ split.splitDistance }} <span class="xsmall">km</span>
      </ColorTag>
    </div>
  </div>
  <div class="cell">
    <div
      v-if="isNotFirstLine"
      class="flex flex-wrap flex-col md:flex-row gap-1 justify-center items-center"
    >
      <ColorTag class="mr-2" color="amber">
        <span class="xsmall">+</span> {{ split.splitElevation }}
        <span class="xsmall">m</span>
      </ColorTag>
      <ColorTag color="amber">
        <span class="xsmall">-</span> {{ split.splitNegativeElevation }}
        <span class="xsmall">m</span>
      </ColorTag>
    </div>
  </div>
  <div class="cell">
    <div v-if="isNotFirstLine">
      <SlopeTag :slope="split.splitSlopePercent">
        {{ split.splitSlopePercent }} <span class="xsmall">%</span>
      </SlopeTag>
    </div>
  </div>
  <div class="cell border-r-1 border-gray-200">
    <div
      v-if="isNotFirstLine && !edition"
      class="flex flex-wrap flex-col md:flex-row gap-1 justify-center items-center"
    >
      <ColorTag icon="pi pi-bolt" color="deep-purple" class="mr-2">
        {{ split.splitPace }}
        <span class="xsmall">min/km</span>
      </ColorTag>
      <ColorTag icon="pi pi-stopwatch" color="green">
        {{ minutesToFormattedDuration(split.splitDuration) }}
      </ColorTag>
    </div>
    <div
      v-if="isNotFirstLine && edition"
      class="flex flex-wrap flex-col md:flex-row gap-1 justify-center items-center"
    >
      <InputPaceDuration
        :pace="split.splitPace"
        :distance="split.splitDistance"
        @update="updatePace"
      />
    </div>
  </div>
  <div class="cell border-r-1 border-gray-200">
    <template v-if="split.refuel && isNotFirstLine && !edition">
      <ColorTag color="pink">
        {{ split.stopDuration }} <span class="xsmall">min</span>
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
          v-if="split.time"
        >
          {{ dateToFormattedTime(split.time) }}
        </ColorTag>
        <ColorTag icon="pi pi-stopwatch" color="green" v-if="isNotFirstLine">
          {{ minutesToFormattedDuration(split.cumulDuration) }}
        </ColorTag>
      </template>
      <template v-if="edition && !isNotFirstLine">
        <InputTime
          :time="split.time"
          :reference="split.time"
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
          v-if="split.timeBarrier"
          icon="pi pi-clock"
          :color="split.timeBarrierValid ? 'bright-green' : 'red'"
          class="mb-2"
        >
          {{ dateToFormattedTime(split.timeBarrier) }}
        </ColorTag>
        <ColorTag
          v-if="split.timeBarrier"
          icon="pi pi-stopwatch"
          :color="split.timeBarrierValid ? 'bright-green' : 'red'"
        >
          {{ minutesToFormattedDuration(split.timeBarrierDuration) }}
        </ColorTag>
      </template>
      <template v-if="isNotFirstLine && edition">
        <InputTime
          :time="split.timeBarrier"
          :reference="race.startTime"
          size="small"
          @update="updateTimeBarrier"
        />
      </template>
    </div>
  </div>
  <div class="cell border-l-1 border-gray-200" v-if="editableMode">
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
        :disabled="split.distance === 0 || split.distance === totalDistance"
        @click="deleteRow"
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
import InputDistance from '@/components/race/inputs/InputDistance.vue';
import InputPaceDuration from '@/components/race/inputs/InputPaceDuration.vue';
import InputRefuelStopDuration from '@/components/race/inputs/InputRefuelStopDuration.vue';
import InputTime from '@/components/race/inputs/InputTime.vue';
import ColorTag from '@/components/tags/ColorTag.vue';
import SlopeTag from '@/components/tags/SlopeTag.vue';
import { useRace } from '@/composables/Race/useRace';
import { useRaceFilters } from '@/composables/Race/useRaceFilters';
import { dateToFormattedTime, minutesToFormattedDuration } from '@/lib/time';
import { SplitItem } from '@/types/SplitItem';
import { Button, ToggleSwitch } from 'primevue';
import { computed, ref, watch } from 'vue';

const props = defineProps<{ split: SplitItem }>();

const {
  totalDistance,
  updateSplitPace,
  updateSeparator,
  updateRaceStartTime,
  deleteSeparator,
  separators,
  race,
} = useRace();

const { editableMode } = useRaceFilters();

const edition = ref<boolean>(false);

const newRowData = ref<{
  refuel: boolean;
  pace: string;
  distance: number;
  stopDuration: number;
  timeBarrier: Date;
  startTime: Date;
}>({
  refuel: props.split.refuel,
  pace: props.split.splitPace,
  distance: props.split.distance,
  stopDuration: props.split.stopDuration,
  timeBarrier: props.split.timeBarrier,
  startTime: props.split.time,
});

const isNotFirstLine = computed(() => {
  return props.split.index !== 0;
});

const isNotLastLine = computed(() => {
  return props.split.distance < totalDistance.value;
});

const separator = computed(() => {
  return separators.value.find((el) => el.distance === props.split.distance);
});

const deleteRow = () => {
  deleteSeparator(props.split.distance);
};

const editRow = () => {
  edition.value = true;
};

const saveRow = () => {
  const { pace, distance, stopDuration, timeBarrier, startTime, refuel } =
    newRowData.value;

  if (props.split.distance === 0) {
    if (startTime !== props.split.time) updateRaceStartTime(startTime);
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
  if (props.split.splitPace !== pace) updateSplitPace(props.split.split, pace);
  if (separator.value !== newSeparator)
    updateSeparator(separator.value, newSeparator);

  uneditRow();
};

const uneditRow = () => {
  edition.value = false;
  newRowData.value = {
    refuel: props.split.refuel,
    pace: props.split.splitPace,
    distance: props.split.distance,
    stopDuration: props.split.stopDuration,
    timeBarrier: props.split.timeBarrier,
    startTime: props.split.time,
  };
};

const updatePace = (data: { pace: string }) => {
  if (data.pace?.match(/^\d{1,2}:\d{2}/)) {
    newRowData.value.pace = data.pace;
  }
};

const updateDistance = (distance: number) => {
  newRowData.value.distance = distance;
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
