<template>
  <div class="mb-3 relative">
    <div class="absolute right-0 top-0 bg-white flex justify-center">
      <div v-if="!edition">
        <Button icon="pi pi-pencil" size="small" text @click="editRow" />
      </div>
      <div v-else>
        <Button icon="pi pi-check" size="small" text @click="saveRow" />
        <Button icon="pi pi-times" size="small" text @click="uneditRow" />
      </div>
    </div>
    <Fieldset :legend="isNotFirstLine ? `${row.distance} km` : 'Départ'">
      <template #legend>
        <div class="flex items-center">
          <div
            :class="
              'font-bold' +
              (row.refuel ? ' text-pink-800' : ' text-primary-800')
            "
            v-if="!edition || (!isNotFirstLine && edition)"
          >
            {{ isNotFirstLine ? `${row.distance} km` : 'Départ' }}
          </div>
          <div v-else>
            <InputDistance :distance="row.distance" @update="updateDistance" />
          </div>
          <div v-if="row.refuel && !edition" class="ml-3">
            <ColorTag color="pink" icon="pi pi-cart-arrow-down" size="xsmall">
              Ravitaillement
            </ColorTag>
          </div>
          <div v-if="edition" class="ml-3">
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
          </div>
        </div>
      </template>

      <template v-if="!isNotFirstLine">
        <div class="flex flex-col gap-2 items-center">
          <span class="flex text-xs font-semibold"> Heure de départ </span>
          <div v-if="!edition">
            <ColorTag icon="pi pi-clock" color="primary" v-if="row.time">
              {{ dateToFormattedTime(row.time) }}
            </ColorTag>
          </div>
          <div v-else class="w-[90px]">
            <InputTime
              :time="row.time"
              :reference="row.time"
              size="small"
              @update="updateStartTime"
            />
          </div>
        </div>
      </template>

      <template v-if="isNotFirstLine">
        <!-- Cumulé -->
        <div class="flex gap-2 justify-center items-center mt-1">
          <span class="flex text-xs font-semibold"> Depuis le départ </span>
          <div class="flex flex-row gap-2">
            <ColorTag color="brown">
              <span class="xsmall">+</span><span>{{ row.cumulElevation }}</span
              ><span class="xsmall">m</span>
            </ColorTag>
            <ColorTag color="brown">
              <span class="xsmall">-</span
              ><span>{{ row.cumulNegativeElevation }}</span
              ><span class="xsmall">m</span>
            </ColorTag>
          </div>
        </div>

        <Divider />

        <!-- Split -->
        <div class="flex flex-col gap-2">
          <div class="flex text-xs font-bold mb-1">Split</div>
          <div class="flex justify-center gap-2">
            <ColorTag color="primary">
              {{ row.splitDistance }} <span class="xsmall">km</span></ColorTag
            >
            <SlopeTag :slope="row.splitSlopePercent">
              {{ row.splitSlopePercent }} <span class="xsmall">%</span>
            </SlopeTag>
            <ColorTag color="amber">
              <span class="xsmall">+</span><span>{{ row.splitElevation }}</span
              ><span class="xsmall">m</span>
            </ColorTag>
            <ColorTag color="amber">
              <span class="xsmall">-</span
              ><span>{{ row.splitNegativeElevation }}</span
              ><span class="xsmall">m</span>
            </ColorTag>
          </div>
          <div class="flex mt-1">
            <div class="flex flex-col items-center flex-1 gap-2">
              <span class="flex text-xs font-semibold text-gray-500">
                Allure / durée
              </span>
              <div class="flex">
                <template v-if="!edition">
                  <ColorTag icon="pi pi-bolt" color="deep-purple" class="mr-2">
                    {{ row.splitPace }}
                    <span class="xsmall">min/km</span>
                  </ColorTag>
                  <ColorTag icon="pi pi-stopwatch" color="green">
                    {{ minutesToFormattedDuration(row.splitDuration) }}
                  </ColorTag>
                </template>
                <template v-else>
                  <InputPaceDuration
                    :pace="row.splitPace"
                    :distance="row.splitDistance"
                    @update="updatePace"
                  />
                </template>
              </div>
            </div>
            <template
              v-if="(row.refuel && !edition) || (edition && newRowData.refuel)"
            >
              <Divider layout="vertical" />
              <div class="flex flex-col gap-2 items-center">
                <span class="flex text-xs font-semibold text-gray-500">
                  Arrêt
                </span>
                <template v-if="!edition">
                  <ColorTag color="pink">
                    {{ row.stopDuration }} <span class="xsmall">min</span>
                  </ColorTag>
                </template>
                <template v-else>
                  <InputRefuelStopDuration
                    :duration="row.stopDuration || 0"
                    @update="updateStopDuration"
                  />
                </template>
              </div>
            </template>
          </div>
        </div>

        <Divider />

        <!-- Durée totale -->
        <div class="flex flex-col">
          <div class="flex flex-row">
            <div class="flex flex-1 flex-col gap-2 items-center">
              <span class="flex text-xs font-semibold justify-center">
                Durée totale
              </span>
              <div class="flex gap-2">
                <ColorTag color="green">
                  {{ minutesToFormattedDuration(row.cumulDuration) }}
                </ColorTag>
                <ColorTag icon="pi pi-clock" color="primary">
                  {{ dateToFormattedTime(row.time) }}
                </ColorTag>
              </div>
            </div>

            <template v-if="row.timeBarrier || edition">
              <Divider layout="vertical" />

              <div class="flex flex-1 flex-col gap-2 items-center">
                <span class="flex text-xs font-semibold">
                  Barrière horraire
                </span>
                <div class="flex gap-2">
                  <template v-if="!edition">
                    <ColorTag
                      :color="row.timeBarrierValid ? 'bright-green' : 'red'"
                    >
                      {{ minutesToFormattedDuration(row.timeBarrierDuration) }}
                    </ColorTag>
                    <ColorTag
                      icon="pi pi-clock"
                      :color="row.timeBarrierValid ? 'bright-green' : 'red'"
                    >
                      {{ dateToFormattedTime(row.timeBarrier) }}
                    </ColorTag>
                  </template>
                  <template v-else>
                    <div class="w-[90px]">
                      <InputTime
                        :time="row.timeBarrier"
                        :reference="race.startTime"
                        size="small"
                        @update="updateTimeBarrier"
                      />
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </Fieldset>
  </div>
</template>

<script setup lang="ts">
import ColorTag from '@/components/ColorTag.vue';
import { useRace } from '@/composables/useRace';
import { dateToFormattedTime, minutesToFormattedDuration } from '@/lib/time';
import { TableRowItem } from '@/types/TableRowItem';
import { Button, Divider, Fieldset, ToggleSwitch } from 'primevue';
import { computed, ref, watch } from 'vue';
import SlopeTag from '../SlopeTag.vue';
import InputDistance from '../inputs/InputDistance.vue';
import InputPaceDuration from '../inputs/InputPaceDuration.vue';
import InputRefuelStopDuration from '../inputs/InputRefuelStopDuration.vue';
import InputTime from '../inputs/InputTime.vue';

const props = defineProps<{ row: TableRowItem }>();
const {
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
.xsmall {
  font-size: 10px;
}

.p-fieldset {
  font-size: 14px;
}
</style>
