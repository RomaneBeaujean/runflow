<template>
  <Button
    label="Simulateur d'allures"
    icon="pi pi-android"
    @click="show = true"
  />

  <Dialog v-model:visible="show" modal class="w-[80%] h-4xl">
    <template #header>
      <span class="font-bold text-xl">
        Simulateur des allures ajustées à la pente
      </span>
    </template>
    <div class="flex flex-col gap-2" v-if="show">
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
                Quelle est votre allure la plus lente en montée, sur la portion
                la plus pentue ({{ Math.round(slopeMax) }}
                %) ?
              </div>
              <div class="w-full">
                <PaceSlider
                  :min="maxPace"
                  :max="30"
                  :step="1 / 60"
                  v-model="minUpPace"
                  :hideGraduation="isMobile"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2 md:w-[50%]">
              <div class="font-semibold text-center">
                Quelle est votre allure la plus lente en descente, sur la
                portion la plus négative ({{ Math.round(slopeMin) }}
                %) ?
              </div>
              <div class="w-full">
                <PaceSlider
                  :min="maxPace"
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
        <div class="flex gap-3 flex-col md:flex-row gap-3">
          <div class="md:w-[50%]">
            <div class="text-center font-bold p-2">Aptitude en montée</div>
            <DifficultiesSlider
              v-model="pUp"
              :min="0.1"
              :step="0.05"
              :max="1"
            />
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
                :min="maxPace"
                :max="minUpPace"
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
          <div>
            <PaceSimulatorChart :splits="splitsWithPace" />
          </div>
        </div>
      </Fieldset>
    </div>
    <template #footer>
      <div>
        <Button
          label="Fermer"
          icon="pi pi-times"
          variant="outlined"
          size="small"
          severity="secondary"
          @click="close"
        />
      </div>
      <div>
        <Button
          size="small"
          icon="pi pi-check"
          variant="outlined"
          label="Appliquer les allures"
          @click="applyAndClose"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import DifficultiesSlider from '@/components/sliders/DifficultiesSlider.vue';
import DurationSlider from '@/components/sliders/DurationSlider.vue';
import PaceSlider from '@/components/sliders/PaceSlider.vue';
import { useRace } from '@/composables/useRace';
import { useViewport } from '@/composables/useViewport';
import { ClimbDetector } from '@/lib/gpx/ClimbDetector';
import { getAveragePace } from '@/lib/gpx/Metrics';
import { PaceCalculator } from '@/lib/gpx/PaceCalculator';
import { computeSplits, recomputeSplits } from '@/lib/Splits';
import { numberToPace, paceToNumber } from '@/lib/time';
import { roundThreeNumber } from '@/lib/utils';
import { Separator } from '@/types/entities/Separator';
import { Split } from '@/types/Split';
import { Button, Dialog, Fieldset } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import PaceSimulatorChart from './PaceSimulatorChart.vue';

const { splits, points, totalDistance, slopeMax, slopeMin, xml, separators } =
  useRace();

const show = ref<boolean>(false);
const maxPace = ref<number>(6.5);
const minUpPace = ref<number>(20);
const minDownPace = ref<number>(10);
const calculator = ref<PaceCalculator>(null);
const splitsWithPace = ref<Split[]>([]);
const averagePace = ref<number>(null);
const totalDuration = ref<number>(null);
const pUp = ref<number>(0.5);
const pDown = ref<number>(2);
const calculatedAveragePace = ref<number>(null);
const calculatedTotalDuration = ref<number>(null);
const { isMobile } = useViewport();

const partialSplits = computed(() => {
  const separators = new ClimbDetector(xml.value).separators;
  const splits = computeSplits([
    ...new Set([...separators, totalDistance.value]),
  ]);
  return splits;
});

const minDuration = computed(() => {
  return Math.round(maxPace.value * totalDistance.value);
});

const maxDuration = computed(() => {
  return Math.round(minUpPace.value * totalDistance.value);
});

const durationFromSplitsAndPace = computed(() => {
  return splitsWithPace.value.reduce((acc, curr) => {
    const distance = curr.endDistance - curr.startDistance;
    const pace = paceToNumber(curr.pace);
    const duration = distance * pace;
    return (acc = acc + duration);
  }, 0);
});

const calculateSplits = () => {
  if (averagePace.value && calculatedAveragePace.value == averagePace.value)
    return;

  splitsWithPace.value = calculator.value.calculateSplitPace({
    splits: partialSplits.value,
    avg: averagePace.value,
    maxPace: maxPace.value,
    upMinPace: minUpPace.value,
    downMinPace: minDownPace.value,
    pUp: pUp.value,
    pDown: pDown.value,
    sOpt: -3,
  });

  if (averagePace.value == null)
    averagePace.value = paceToNumber(getAveragePace(splitsWithPace.value, []));
  if (totalDuration.value == null)
    totalDuration.value = durationFromSplitsAndPace.value;
  calculatedAveragePace.value = paceToNumber(
    getAveragePace(splitsWithPace.value, [])
  );
  calculatedTotalDuration.value = durationFromSplitsAndPace.value;
};

const close = () => {
  show.value = false;
  averagePace.value = null;
  totalDuration.value = null;
  calculatedAveragePace.value = null;
  calculatedTotalDuration.value = null;
  pUp.value = 0.5;
  pDown.value = 2;
};

const applyAndClose = () => {
  const oldDistances = separators.value.map((el) => el.distance);
  const splitsSeparators = splitsWithPace.value
    .map((el) => el.endDistance)
    .filter((el) => !oldDistances.includes(el))
    .map((el) => new Separator({ distance: el }));

  const allSeparators = [...separators.value, ...splitsSeparators].sort(
    (a, b) => a.distance - b.distance
  );

  splits.value = recomputeSplits({
    separators: allSeparators.map((it) => it.distance),
    oldSplits: splitsWithPace.value,
    totalDistance: totalDistance.value,
    averagePace: numberToPace(averagePace.value),
  });

  separators.value = allSeparators;

  close();
};

onMounted(async () => {
  calculator.value = new PaceCalculator({
    points: points.value,
    slopeMax: slopeMax.value,
    slopeMin: slopeMin.value,
    totalDistance: totalDistance.value,
  });
  calculateSplits();
});

watch([minDownPace, minUpPace, maxPace, pUp, pDown], () => {
  averagePace.value = null;
  totalDuration.value = null;
  calculateSplits();
});

watch([averagePace], () => {
  if (averagePace.value == calculatedAveragePace.value) return;
  totalDuration.value = null;
  calculateSplits();
});

watch([totalDuration], () => {
  if (
    Math.round(totalDuration.value) == Math.round(calculatedTotalDuration.value)
  )
    return;
  const newPace = totalDuration.value / totalDistance.value;
  if (roundThreeNumber(averagePace.value) !== roundThreeNumber(newPace)) {
    averagePace.value = newPace;
  }
});

watch([show], () => {
  if (show.value) {
    calculateSplits();
  }
});
</script>

<style lang="scss"></style>
