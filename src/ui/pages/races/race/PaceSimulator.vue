<template>
  <template v-if="!onlyAveragePace">
    <Fieldset legend="Allures ajustées à la pente">
      <div class="flex flex-col md:gap-10 gap-3 md:p-5">
        <div class="flex justify-center">
          <div class="flex flex-col gap-2 md:w-[70%] md:p-3">
            <div class="font-semibold text-center">
              Quelle est votre allure la plus rapide, sur une pente parfaite
              (environ -3%) ?
            </div>
            <div class="w-full">
              <PaceSlider
                :min="2"
                :max="18"
                :step="1 / 60"
                :hideGraduation="isMobile"
                v-model="maxPace"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-col md:flex-row gap-3">
          <div class="flex flex-col gap-2 md:w-[50%]">
            <div class="font-semibold text-center">
              Quelle est votre allure la plus lente en montée, sur la portion la
              plus pentue ({{ Math.round(parsedFile.slopeMax) }}
              %) ?
            </div>
            <div class="w-full">
              <PaceSlider
                :min="Math.floor(maxPace)"
                :max="30"
                :step="1 / 60"
                v-model="minUpPace"
                :hideGraduation="isMobile"
              />
            </div>
          </div>
          <div class="flex flex-col gap-2 md:w-[50%]">
            <div class="font-semibold text-center">
              Quelle est votre allure la plus lente en descente, sur la portion
              la plus négative ({{ Math.round(parsedFile.slopeMin) }}
              %) ?
            </div>
            <div class="w-full">
              <PaceSlider
                :min="Math.floor(maxPace)"
                :max="30"
                :step="1 / 60"
                v-model="minDownPace"
                :hideGraduation="isMobile"
              />
            </div>
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
          <DifficultiesSlider
            v-model="pDown"
            :min="0.1"
            :max="4"
            :step="0.05"
          />
        </div>
      </div>
    </Fieldset>
    <Fieldset legend="Graphique des allures calculées">
      <div>
        <div class="flex flex-col md:flex-row gap-3">
          <div class="md:w-[50%]">
            <div class="text-center font-bold p-2">Allure moyenne</div>
            <PaceSlider
              v-model="averagePace"
              :min="Math.floor(maxPace)"
              :max="Math.floor(minUpPace)"
              :step="1 / 60"
              :hideGraduation="isMobile"
            />
          </div>
          <div class="md:w-[50%]">
            <div class="text-center font-bold p-2">Durée totale</div>
            <DurationSlider
              v-model="totalDuration"
              :step="1"
              :min="minDuration"
              :max="maxDuration"
            />
          </div>
        </div>
        <div class="h-[250px] md:h-[400px]">
          <PaceSimulatorChart
            :splits="splits"
            :points="points"
            :slidingSlopesPoints="slidingSlopesPoints"
          />
        </div>
      </div>
    </Fieldset>
  </template>
  <template v-else>
    <div>
      <div class="flex flex-col md:flex-row gap-3">
        <div class="md:w-[50%]">
          <div class="text-center font-bold p-2">Allure moyenne</div>
          <PaceSlider
            v-model="averagePace"
            :min="Math.floor(maxPace)"
            :max="Math.floor(minUpPace)"
            :step="1 / 60"
            :hideGraduation="isMobile"
          />
        </div>
        <div class="md:w-[50%]">
          <div class="text-center font-bold p-2">Durée totale</div>
          <DurationSlider
            v-model="totalDuration"
            :step="1"
            :min="minDuration"
            :max="maxDuration"
          />
        </div>
      </div>
      <div class="h-[250px] md:h-[400px]">
        <PaceSimulatorChart
          :splits="splits"
          :points="points"
          :slidingSlopesPoints="slidingSlopesPoints"
        />
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ClimbDetector } from '@/domain/ClimbDetector';
import {
  roundOneNumber,
  roundThreeNumber,
} from '@/domain/helpers/RoundNumbers.helper';
import { paceToNumber } from '@/domain/helpers/Time.helper';
import { GpxParse } from '@/domain/lib/gpx/GpxParse';
import { PaceCalculator } from '@/domain/PaceCalculator';
import { computeSlidingSlopeKm } from '@/domain/Slopes';
import { computeSplits } from '@/domain/Splits';
import { Split } from '@/types/Split';
import DifficultiesSlider from '@/ui/components/sliders/DifficultiesSlider.vue';
import DurationSlider from '@/ui/components/sliders/DurationSlider.vue';
import PaceSlider from '@/ui/components/sliders/PaceSlider.vue';
import { useViewport } from '@/ui/composables/useViewport';
import { Fieldset } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import PaceSimulatorChart from './pace-simulator/PaceSimulatorChart.vue';

const props = defineProps<{
  parsedFile: GpxParse;
  modelValue: Split[];
  onlyAveragePace?: boolean;
}>();

const { isMobile } = useViewport();
const calculator = ref<PaceCalculator>(null);
const points = ref([]);
const slidingSlopesPoints = ref([]);
const splits = ref<Split[]>(props.modelValue);
const separators = ref<number[]>();

// CALCULATOR PARAMS
const maxPace = ref<number>(5);
const minUpPace = ref<number>(16);
const minDownPace = ref<number>(7);
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

watch([totalDuration], () => {
  if (Math.round(totalDuration.value) == Math.round(calculatedDuration.value))
    return;
  const newPace = totalDuration.value / props.parsedFile.totalDistance;
  if (roundThreeNumber(averagePace.value) !== roundThreeNumber(newPace)) {
    averagePace.value = newPace;
  }
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: Split[]): void;
}>();

watch([splits], () => {
  emit('update:modelValue', splits.value);
});
</script>

<style lang="scss"></style>
