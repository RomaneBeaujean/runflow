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
    <div class="flex flex-col gap-2">
      <Fieldset legend="Ajustement des allures">
        <div class="flex flex-col gap-10 p-5">
          <div class="flex justify-center">
            <div class="flex flex-col gap-2 w-[70%] p-3">
              <div class="font-semibold text-center">
                Quelle est votre allure la plus rapide, sur une pente parfaite
                (environ -3%) ?
              </div>
              <div class="w-full">
                <PaceSlider :min="2" :max="18" :step="0.5" v-model="maxPace" />
              </div>
            </div>
          </div>
          <div class="flex">
            <div class="flex flex-col gap-2 w-[50%]">
              <div class="font-semibold text-center">
                Quelle est votre allure la plus lente en montée, sur la portion
                la plus pentue ({{ Math.round(slopeMax) }}
                %) ?
              </div>
              <div class="w-full">
                <PaceSlider
                  :min="maxPace"
                  :max="30"
                  :step="0.5"
                  v-model="minUpPace"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2 w-[50%]">
              <div class="font-semibold text-center">
                Quelle est votre allure la plus lente en descente, sur la
                portion la plus négative ({{ Math.round(slopeMin) }}
                %) ?
              </div>
              <div class="w-full">
                <PaceSlider
                  :min="maxPace"
                  :max="30"
                  :step="0.5"
                  v-model="minDownPace"
                />
              </div>
            </div>
          </div>
        </div>
      </Fieldset>
      <Fieldset legend="Graphique des allures calculées">
        <div>
          <div class="flex gap-3">
            <div class="w-[50%]">
              <div class="text-center font-bold p-2">Allure moyenne</div>
              <PaceSlider
                v-model="averagePace"
                :min="maxPace"
                :max="minUpPace"
                :step="0.5"
              />
            </div>
            <div class="w-[50%]">
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
            <VChart
              autoresize
              ref="automaticPaceChartRef"
              style="position: relative; width: 100%; min-height: 400px"
              :option="chartOptions"
            />
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
      <!-- <div>
        <Button
          size="small"
          icon="pi pi-download"
          variant="outlined"
          label="Appliquer"
        />
      </div> -->
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useRace } from '@/composables/useRace';
import { useRaceMetrics } from '@/composables/useRaceMetrics';
import { useViewport } from '@/composables/useViewport';
import { getMarkLineColorStops, getPaceColor } from '@/lib/colors';
import { ClimbDetector } from '@/lib/gpx/ClimbDetector';
import { getAveragePace } from '@/lib/gpx/Metrics';
import { PaceCalculator } from '@/lib/gpx/PaceCalculator';
import { getSlopeColors } from '@/lib/gpx/SlopeMetrix';
import { computeSplits } from '@/lib/Splits';
import { numberToPace, paceToNumber } from '@/lib/time';
import { roundOneNumber } from '@/lib/utils';
import { Split } from '@/types/Split';
import { LineChart } from 'echarts/charts';
import {
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { Button, Dialog, Fieldset } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import VChart from 'vue-echarts';
import DurationSlider from './inputs/DurationSlider.vue';
import PaceSlider from './inputs/PaceSlider.vue';

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  MarkLineComponent,
  GraphicComponent,
]);

const { points, totalDistance, slopeMax, slopeMin, xml } = useRace();

const { getSlopeFromDistance } = useRaceMetrics();
const automaticPaceChartRef = ref(null);
const show = ref<boolean>(false);
const maxPace = ref<number>(6);
const minUpPace = ref<number>(15);
const minDownPace = ref<number>(9);
const calculator = ref<PaceCalculator>(null);
const splitsWithPace = ref<Split[]>([]);
const averagePace = ref<number>(null);
const totalDuration = ref<number>(null);
const calculatedAveragePace = ref<number>(null);
const calculatedTotalDuration = ref<number>(null);
const { isMobile } = useViewport();

onMounted(async () => {
  calculator.value = new PaceCalculator({
    points: points.value,
    slopeMax: slopeMax.value,
    slopeMin: slopeMin.value,
    totalDistance: totalDistance.value,
  });
  calculate();
});

watch([show], () => {
  if (show.value) {
    calculate();
  }
});

const splits = computed(() => {
  const separators = new ClimbDetector(xml.value).separators;
  const splits = computeSplits([
    ...new Set([0, ...separators, totalDistance.value]),
  ]);
  return splits;
});

const minDuration = computed(() => {
  return Math.round(maxPace.value * totalDistance.value);
});

const maxDuration = computed(() => {
  return Math.round(minUpPace.value * totalDistance.value);
});

const finalAveragePace = computed(() => {
  const avg = getAveragePace(splitsWithPace.value, [], totalDistance.value);
  return avg;
});

const finalTotalDuration = computed(() => {
  return splitsWithPace.value.reduce((acc, curr) => {
    const distance = curr.endDistance - curr.startDistance;
    const pace = paceToNumber(curr.pace);
    const duration = distance * pace;
    return (acc = acc + duration);
  }, 0);
});

const finalPaces = computed(() => {
  const paces = splitsWithPace.value.map((it) => paceToNumber(it.pace));
  return {
    max: Math.max(...paces),
    min: Math.min(...paces),
  };
});

const series = computed(() => {
  return [
    {
      id: 'points',
      smooth: false,
      showSymbol: false,
      type: 'line',
      data: points.value.map((p) => [p.distance, p.elevation]),
      lineStyle: { color: '#DEDEDE', width: 2 },
      areaStyle: { color: '#DEDEDE' },
      emphasis: {
        disabled: true,
      },
    },
    ...splitsWithPace.value.map((split, index) => {
      const points = getPointsFromSplit(split);
      const currentPace = paceToNumber(split.pace);
      const paceColor = getPaceColor(
        currentPace,
        paceToNumber(finalAveragePace.value),
        maxPace.value,
        minUpPace.value
      );
      const nextSplit =
        index == splitsWithPace.value.length - 1
          ? null
          : splitsWithPace.value[index + 1];
      const nextPace = !nextSplit ? currentPace : paceToNumber(nextSplit.pace);
      const startPace = Math.max(currentPace, nextPace);
      const endPace = Math.min(currentPace, nextPace);

      const serie = {
        id: `pace-${split.startDistance}-${split.endDistance}`,
        type: 'line',
        symbol: 'rect',
        animation: false,
        itemStyle: {
          opacity: 0,
        },
        data: points.map((p) => [p.distance, currentPace]),
        smooth: false,
        showSymbol: false,
        yAxisIndex: 1,
        lineStyle: {
          color: paceColor,
          width: 3,
        },
        markLine: {
          yAxisIndex: 1,
          animation: false,
          symbol: 'none',
          silent: true,
          lineStyle: {
            width: 3,
            type: 'solid',
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: getMarkLineColorStops(
                startPace,
                endPace,
                paceToNumber(finalAveragePace.value),
                finalPaces.value.min,
                finalPaces.value.max
              ),
            },
          },
          data: [
            [
              { xAxis: split.endDistance, yAxis: currentPace },
              { xAxis: split.endDistance, yAxis: nextPace },
            ],
          ],
        },
      };
      return serie;
    }),
  ];
});

const yAxis = computed(() => {
  return !isMobile.value
    ? [
        {
          type: 'value',
          position: 'left',
          show: isMobile.value ? false : true,
          axisLabel: {
            formatter: (v: number) => (v % 100 === 0 ? `${v} m` : ''),
          },
        },
        {
          type: 'value',
          position: 'right',
          show: isMobile.value ? false : true,
          axisLabel: {
            formatter: (v: number) => {
              const minutes = Math.floor(v);
              const seconds = Math.round((v - minutes) * 60);
              return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
            },
          },
        },
      ]
    : [];
});

const chartOptions = ref({
  tooltip: {
    show: true,
    trigger: 'axis',
    renderMode: 'html',
    backgroundColor: 'transparent',
    borderWidth: 0,
    textStyle: {
      color: '#fff',
      fontSize: 12,
    },
    padding: 0,
    position: (point, params, dom, rect, size) => {
      return getTooltipPosition(point, size);
    },
    formatter: (params: any) => {
      return getTooltipContent(params);
    },
  },
  grid: {
    top: 40,
    right: 16,
    bottom: isMobile.value ? 0 : 60,
    left: 8,
  },
  xAxis: {
    type: 'value',
    boundaryGap: false,
    min: 0,
    max: totalDistance ?? 0,
  },
  yAxis: yAxis.value,
  series: [],
});

const calculate = () => {
  if (averagePace.value && calculatedAveragePace.value == averagePace.value)
    return;
  splitsWithPace.value = calculator.value.calculateSplitPace({
    splits: splits.value,
    avg: averagePace.value,
    maxPace: maxPace.value,
    upMinPace: minUpPace.value,
    downMinPace: minDownPace.value,
    pUp: 0.5,
    pDown: 2,
    sOpt: -3,
  });
  if (averagePace.value == null) {
    averagePace.value = paceToNumber(finalAveragePace.value);
    calculatedAveragePace.value = paceToNumber(finalAveragePace.value);
    calculatedTotalDuration.value = finalTotalDuration.value;
    totalDuration.value = finalTotalDuration.value;
  }
  updateChartData();
};

const getTooltipPosition = (point: any, size: any) => {
  const [x] = point;
  const [tooltipWidth] = size.contentSize;
  const viewportWidth = window.innerWidth;
  const margin = 10;
  const isOverflowingRight = x + tooltipWidth + margin > viewportWidth;
  const left = isOverflowingRight ? x - tooltipWidth - margin : x + margin;
  const top = 40;
  return [`${left}px`, `${top}px`];
};

const getTooltipContent = (params: any) => {
  const [p] = params;

  // Distance
  const distance = p.value[0];

  // Slope
  const slope = getSlopeFromDistance(distance);
  const { color } = getSlopeColors(slope);
  const slopeDiv = `<div>Pente: <span style="color: ${color}"><b>${slope}%</b></span></div>`;
  // Pace
  const paceSerie = params.find((p: any) => p.seriesId?.startsWith('pace-'));
  const pace = paceSerie ? numberToPace(paceSerie.value[1]) : null;
  const paceDiv = `<div>Allure: <b>${pace}/km</b></div>`;

  const fontSize = isMobile.value ? '10px' : '12px';
  const padding = isMobile.value ? '2px' : '4px';
  const lineHeight = isMobile.value ? '12px' : '14px';

  const style = `display: flex; flex-direction: column; opacity: 0.8; background: white; border-radius:4px; color: black; padding: ${padding}; line-height: ${lineHeight} font-size: ${fontSize}`;

  return `<div style='${style}'>
    ${paceDiv}
    ${slopeDiv}
    </div>`;
};

function getIndexFromDistance(distance: number) {
  return points.value.findIndex((el) => el.distance >= distance);
}

function getPointsFromSplit(split: Partial<Split>) {
  const startIndex = getIndexFromDistance(split.startDistance);
  const endIndex = getIndexFromDistance(split.endDistance);
  return points.value.slice(startIndex, endIndex + 1);
}

const updateChartData = () => {
  const options = {
    ...chartOptions.value,
    legend: { show: !isMobile.value },
    yAxis: yAxis.value,
    series: [...series.value],
  };
  chartOptions.value = options;
};

const close = () => {
  show.value = false;
  averagePace.value = null;
  totalDuration.value = null;
  calculatedAveragePace.value = null;
  calculatedTotalDuration.value = null;
};

watch([minDownPace, minUpPace, maxPace], () => {
  averagePace.value = null;
  calculatedAveragePace.value = null;
  calculatedTotalDuration.value = null;
  totalDuration.value = null;
  calculate();
});

watch(totalDuration, () => {
  const newPace = totalDuration.value / totalDistance.value;
  if (roundOneNumber(averagePace.value) !== roundOneNumber(newPace)) {
    averagePace.value = newPace;
  }
});

watch([averagePace], () => {
  const newDuration = averagePace.value * totalDistance.value;
  const oldDuration = totalDuration.value;
  if (Math.round(newDuration) !== Math.round(oldDuration)) {
    totalDuration.value = newDuration;
  }
});
</script>

<style lang="scss"></style>
