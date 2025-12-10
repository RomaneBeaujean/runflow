<template>
  <div class="relative">
    <div
      class="absolute right-0 top-0 bg-white flex justify-center"
      v-if="editableMode"
    >
      <div v-if="!edition">
        <Button icon="pi pi-pencil" text rounded @click="editRow" />
      </div>
      <div v-else class="flex gap-2">
        <Button icon="pi pi-check" @click="saveRow" rounded />
        <Button icon="pi pi-times" @click="uneditRow" rounded />
      </div>
    </div>
    <div
      class="absolute bottom-0 right-0 translate-y-[-50%] bg-white"
      v-if="editableMode"
    >
      <Button
        icon="pi pi-trash"
        text
        rounded
        v-if="isNotFirstLine && isNotLastLine"
        @click="deleteRow"
      />
    </div>
    <Fieldset :legend="isNotFirstLine ? `${split.distance} km` : 'Départ'">
      <template #legend>
        <div class="flex items-center">
          <div
            :class="
              'font-bold' +
              (split.refuel ? ' text-pink-800' : ' text-primary-800')
            "
            v-if="!edition || !isNotFirstLine || !isNotLastLine"
          >
            {{ isNotFirstLine ? `${split.distance} km` : 'Départ' }}
          </div>
          <div v-else>
            <InputDistance
              :distance="split.distance"
              @update="updateDistance"
            />
          </div>
          <div v-if="split.refuel && !edition" class="ml-3">
            <ColorTag color="pink" icon="pi pi-cart-arrow-down" size="xsmall">
              Ravitaillement
            </ColorTag>
          </div>
          <div v-if="edition && isNotFirstLine" class="ml-3">
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
          </div>
        </div>
      </template>

      <template v-if="!isNotFirstLine">
        <div class="flex flex-col gap-2 items-center">
          <span class="flex text-xs font-semibold"> Heure de départ </span>
          <div v-if="!edition">
            <ColorTag icon="pi pi-clock" color="primary" v-if="split.time">
              {{ dateToFormattedTime(split.time) }}
            </ColorTag>
            <span class="text-xs" v-else> Non renseigné </span>
          </div>
          <div v-else class="w-[90px]">
            <InputTime
              :time="split.time"
              :reference="split.time"
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
              <span class="xsmall">+</span
              ><span>{{ split.cumulElevation }}</span
              ><span class="xsmall">m</span>
            </ColorTag>
            <ColorTag color="brown">
              <span class="xsmall">-</span
              ><span>{{ split.cumulNegativeElevation }}</span
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
              {{ split.splitDistance }} <span class="xsmall">km</span></ColorTag
            >
            <ColorTag color="amber">
              <span class="xsmall">+</span
              ><span>{{ split.splitElevation }}</span
              ><span class="xsmall">m</span>
            </ColorTag>
            <ColorTag color="amber">
              <span class="xsmall">-</span
              ><span>{{ split.splitNegativeElevation }}</span
              ><span class="xsmall">m</span>
            </ColorTag>
            <SlopeTag :slope="split.splitSlopePercent">
              {{ split.splitSlopePercent }} <span class="xsmall">%</span>
            </SlopeTag>
          </div>
          <div class="flex mt-1">
            <div class="flex flex-col items-center flex-1 gap-2">
              <span class="flex text-xs font-semibold text-gray-500">
                Allure / durée
              </span>
              <div class="flex">
                <template v-if="!edition">
                  <ColorTag icon="pi pi-bolt" color="deep-purple" class="mr-2">
                    {{ split.splitPace }}
                    <span class="xsmall">min/km</span>
                  </ColorTag>
                  <ColorTag icon="pi pi-stopwatch" color="green">
                    {{ minutesToFormattedDuration(split.splitDuration) }}
                  </ColorTag>
                </template>
                <template v-else>
                  <InputPaceDuration
                    :pace="split.splitPace"
                    :distance="split.splitDistance"
                    @update="updatePace"
                  />
                </template>
              </div>
            </div>
            <template
              v-if="
                (split.refuel && !edition) || (edition && newRowData.refuel)
              "
            >
              <Divider layout="vertical" />
              <div class="flex flex-col gap-2 items-center">
                <span class="flex text-xs font-semibold text-gray-500">
                  Arrêt
                </span>
                <template v-if="!edition">
                  <ColorTag color="pink">
                    {{ split.stopDuration }} <span class="xsmall">min</span>
                  </ColorTag>
                </template>
                <template v-else>
                  <InputRefuelStopDuration
                    :duration="split.stopDuration || 0"
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
                Temps écoulé / Heure
              </span>
              <div class="flex gap-2">
                <ColorTag color="primary" icon="pi pi-stopwatch">
                  {{ minutesToFormattedDuration(split.cumulDuration) }}
                </ColorTag>
                <ColorTag icon="pi pi-clock" color="green" v-if="split.time">
                  {{ dateToFormattedTime(split.time) }}
                </ColorTag>
              </div>
            </div>

            <template v-if="split.timeBarrier || edition">
              <Divider layout="vertical" />

              <div class="flex flex-1 flex-col gap-2 items-center">
                <span class="flex text-xs font-semibold">
                  Barrière horraire (heure)
                </span>
                <div class="flex gap-2">
                  <template v-if="!edition">
                    <ColorTag
                      icon="pi pi-clock"
                      :color="split.timeBarrierValid ? 'bright-green' : 'red'"
                    >
                      {{ dateToFormattedTime(split.timeBarrier) }}
                    </ColorTag>
                  </template>
                  <template v-else>
                    <div class="w-[90px]">
                      <InputTime
                        :time="split.timeBarrier"
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

    <div
      class="flex justify-center mt-2"
      v-if="editableMode && split.distance !== totalDistance"
    >
      <AddSeparatorMobile />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputDistance from '@/components/inputs/InputDistance.vue';
import InputPaceDuration from '@/components/inputs/InputPaceDuration.vue';
import InputRefuelStopDuration from '@/components/inputs/InputRefuelStopDuration.vue';
import InputTime from '@/components/inputs/InputTime.vue';
import AddSeparatorMobile from '@/components/race/AddSeparatorMobile.vue';
import ColorTag from '@/components/tags/ColorTag.vue';
import SlopeTag from '@/components/tags/SlopeTag.vue';
import { useRace } from '@/composables/useRace';
import { useRaceChartParams } from '@/composables/useRaceChartParams';
import { dateToFormattedTime, minutesToFormattedDuration } from '@/lib/time';
import { SplitItem } from '@/types/SplitItem';
import { Button, Divider, Fieldset, ToggleSwitch } from 'primevue';
import { computed, ref, watch } from 'vue';

const props = defineProps<{ split: SplitItem }>();
const {
  updateSplitPace,
  updateSeparator,
  updateRaceStartTime,
  deleteSeparator,
  separators,
  race,
  totalDistance,
} = useRace();
const { editableMode } = useRaceChartParams();

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
