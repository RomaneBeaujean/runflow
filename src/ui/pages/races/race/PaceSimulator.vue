<template>
  <template v-if="!onlyAveragePace">
    <Fieldset legend="Allures ajustées à la pente">
      <div class="flex flex-col md:flex-row gap-6 md:p-4">
        <div class="flex flex-col gap-2 items-center flex-1">
          <div class="text-sm font-semibold text-center text-gray-700">
            Allure la plus rapide<br class="hidden md:block" />
            <span class="text-gray-400 font-normal">(pente ~-3%)</span>
          </div>
          <div class="flex items-center gap-2">
            <InputMask v-model="maxPaceStr" mask="99:99" placeholder="MM:SS" size="small" style="width: 72px" />
            <span class="text-xs text-gray-400">min/km</span>
          </div>
        </div>
        <div class="hidden md:block w-px bg-gray-200 self-stretch" />
        <div class="flex flex-col gap-2 items-center flex-1">
          <div class="text-sm font-semibold text-center text-gray-700">
            Allure montée max<br class="hidden md:block" />
            <span class="text-gray-400 font-normal">({{ Math.round(parsedFile.slopeMax) }}%)</span>
          </div>
          <div class="flex items-center gap-2">
            <InputMask v-model="minUpPaceStr" mask="99:99" placeholder="MM:SS" size="small" style="width: 72px" />
            <span class="text-xs text-gray-400">min/km</span>
          </div>
        </div>
        <div class="hidden md:block w-px bg-gray-200 self-stretch" />
        <div class="flex flex-col gap-2 items-center flex-1">
          <div class="text-sm font-semibold text-center text-gray-700">
            Allure descente max<br class="hidden md:block" />
            <span class="text-gray-400 font-normal">({{ Math.round(parsedFile.slopeMin) }}%)</span>
          </div>
          <div class="flex items-center gap-2">
            <InputMask v-model="minDownPaceStr" mask="99:99" placeholder="MM:SS" size="small" style="width: 72px" />
            <span class="text-xs text-gray-400">min/km</span>
          </div>
        </div>
      </div>
    </Fieldset>
    <Fieldset legend="Aptitudes en montée / descente">
      <div class="flex flex-col md:flex-row gap-3">
        <div class="md:w-[50%]">
          <div class="text-center font-bold p-2">Aptitude en montée</div>
          <DifficultiesSlider v-model="pUp" :min="0.1" :step="0.05" :max="1" />
        </div>
        <div class="md:w-[50%]">
          <div class="text-center font-bold p-2">Aptitude en descente</div>
          <DifficultiesSlider v-model="pDown" :min="0.1" :max="4" :step="0.05" />
        </div>
      </div>
    </Fieldset>
    <Fieldset legend="Graphique des allures calculées">
      <div>
        <div class="flex justify-center mb-4">
          <div class="flex flex-col items-center gap-1">
            <div class="text-center font-bold p-2">Allure / Durée totale</div>
            <InputPaceDuration
              :pace="numberToPace(averagePace)"
              :distance="parsedFile.totalDistance"
              @update="onPaceUpdate"
            />
          </div>
        </div>
        <div class="h-[250px] md:h-[400px]">
          <PaceSimulatorChart :splits="splits" :points="points" :slidingSlopesPoints="slidingSlopesPoints" />
        </div>
      </div>
    </Fieldset>
  </template>
  <template v-else>
    <div>
      <div class="flex justify-center mb-4">
        <div class="flex flex-col items-center gap-1">
          <div class="text-center font-bold p-2">Allure / Durée totale</div>
          <InputPaceDuration
            :pace="numberToPace(averagePace)"
            :distance="parsedFile.totalDistance"
            @update="onPaceUpdate"
          />
        </div>
      </div>
      <div class="h-[250px] md:h-[400px]">
        <PaceSimulatorChart :splits="splits" :points="points" :slidingSlopesPoints="slidingSlopesPoints" />
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import {
  roundOneNumber,
  roundThreeNumber,
} from '@/domain/helpers/round-number';
import { numberToPace, paceToNumber } from '@/domain/helpers/time';
import InputPaceDuration from '@/ui/components/inputs/InputPaceDuration.vue';
import { GpxParse } from '@/domain/lib/gpx/GpxParse';
import { ClimbDetector } from '@/domain/services/ClimbDetector';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { computeSlidingSlopeKm } from '@/domain/services/Slopes';
import { computeSplits } from '@/domain/services/Splits';
import { Split } from '@/domain/types/Split';
import DifficultiesSlider from '@/ui/components/sliders/DifficultiesSlider.vue';
import { Fieldset, InputMask } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import PaceSimulatorChart from './pace-simulator/PaceSimulatorChart.vue';

const props = defineProps<{
  parsedFile: GpxParse;
  modelValue: Split[];
  onlyAveragePace?: boolean;
}>();

const calculator = ref<PaceCalculator>(null);
const points = ref([]);
const slidingSlopesPoints = ref([]);
const splits = ref<Split[]>(props.modelValue);
const separators = ref<number[]>();

// CALCULATOR PARAMS
const maxPace = ref<number>(5);
const minUpPace = ref<number>(16);
const minDownPace = ref<number>(7);

// Pace string refs for InputMask (MM:SS)
const toPaceStr = (n: number) => numberToPace(n).slice(0, 5);
const parsePaceStr = (s: string) => (s?.match(/^\d{1,2}:\d{2}$/) ? paceToNumber(s) : null);

const maxPaceStr = ref(toPaceStr(maxPace.value));
const minUpPaceStr = ref(toPaceStr(minUpPace.value));
const minDownPaceStr = ref(toPaceStr(minDownPace.value));

watch(maxPaceStr, (v) => { const p = parsePaceStr(v); if (p !== null) maxPace.value = p; });
watch(minUpPaceStr, (v) => { const p = parsePaceStr(v); if (p !== null) minUpPace.value = p; });
watch(minDownPaceStr, (v) => { const p = parsePaceStr(v); if (p !== null) minDownPace.value = p; });
watch(maxPace, (v) => { maxPaceStr.value = toPaceStr(v); });
watch(minUpPace, (v) => { minUpPaceStr.value = toPaceStr(v); });
watch(minDownPace, (v) => { minDownPaceStr.value = toPaceStr(v); });
const totalDuration = ref<number>(0);
const pUp = ref<number>(0.5);
const pDown = ref<number>(2);
const averagePace = ref<number>(0);

const minDuration = computed(() => {
  return Math.round(maxPace.value * props.parsedFile.totalDistance);
});

const maxDuration = computed(() => {
  return Math.round(minUpPace.value * props.parsedFile.totalDistance);
});

const partialSplits = computed(() => {
  return computeSplits([
    ...new Set([...separators.value, props.parsedFile.totalDistance]),
  ]);
});

const calculatedAveragePace = computed(() => {
  return calculatedDuration.value / props.parsedFile.totalDistance;
});

const calculatedDuration = computed(() => {
  return splits.value.reduce((acc, curr) => {
    const distance = curr.endDistance - curr.startDistance;
    const pace = paceToNumber(curr.pace);
    const duration = distance * pace;
    return (acc = acc + duration);
  }, 0);
});

const calculateSplits = () => {
  splits.value = calculator.value.calculateSplitPace({
    splits: partialSplits.value,
    avg: averagePace.value == 0 ? null : averagePace.value,
    maxPace: maxPace.value,
    upMinPace: minUpPace.value,
    downMinPace: minDownPace.value,
    pUp: pUp.value,
    pDown: pDown.value,
    sOpt: -3,
  });

  averagePace.value = roundOneNumber(calculatedAveragePace.value);
  totalDuration.value = roundThreeNumber(calculatedDuration.value);
};
const initialize = () => {
  points.value = props.parsedFile.smoothedPoints;
  slidingSlopesPoints.value = computeSlidingSlopeKm(points.value, 0.3);
  separators.value = new ClimbDetector(props.parsedFile).separators;
  calculator.value = new PaceCalculator(props.parsedFile);
};

const clearData = () => {
  points.value = [];
  slidingSlopesPoints.value = [];
  maxPace.value = 6.5;
  minUpPace.value = 20;
  minDownPace.value = 10;
  totalDuration.value = 0;
  pUp.value = 0.5;
  pDown.value = 2;
  averagePace.value = 0;
};

onMounted(() => {
  clearData();
  initialize();
  calculateSplits();
});

watch([minDownPace, minUpPace, maxPace, pUp, pDown], () => {
  averagePace.value = 0;
  totalDuration.value = 0;
  calculateSplits();
});

watch([averagePace], () => {
  if (
    roundOneNumber(averagePace.value) ==
    roundOneNumber(calculatedAveragePace.value)
  )
    return;
  calculateSplits();
});

const onPaceUpdate = (data: { pace: string }) => {
  if (data.pace?.match(/^\d{1,2}:\d{2}/)) {
    averagePace.value = paceToNumber(data.pace.slice(0, 5));
  }
};

const emit = defineEmits<{
  (e: 'update:modelValue', v: Split[]): void;
}>();

watch([splits], () => {
  emit('update:modelValue', splits.value);
});
</script>

<style lang="scss"></style>
