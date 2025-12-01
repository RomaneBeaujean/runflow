<template>
  <div class="flex p-5 gap-5" v-if="totalDistance">
    <div>
      <InputPaceDuration
        size="default"
        :pace="avg"
        :distance="totalDistance || 0"
        @update="(newPace) => (avg = newPace.pace)"
      ></InputPaceDuration>
    </div>
  </div>
  <div class="flex gap-5 p-5">
    Max pace:
    <InputNumber v-model="maxPace" showButtons :min="3" :step="0.1" />
    Min Down Pace:
    <InputNumber v-model="minDownPace" showButtons :min="0" :step="0.1" />
    Min Up Pace:
    <InputNumber v-model="minUpPace" showButtons :min="0" :step="1" />
  </div>
  <div class="flex gap-5 p-5">
    Optimal slope :
    <InputNumber v-model="sOpt" showButtons :step="1" />
    p Montée :
    <InputNumber v-model="pUp" showButtons :min="0" :step="0.1" />
    p Desc :
    <InputNumber v-model="pDown" showButtons :min="0" :step="0.1" />
  </div>
  <div>Allure moyenne finale: {{ finalAvg }}</div>
  <div>Durée finale: {{ finalDuration }}</div>
  <div>
    <VChart
      v-if="xml"
      autoresize
      ref="chartRef"
      style="position: relative; width: 100%; min-height: 400px"
      :option="chartOptions2"
    />
  </div>
  <div>
    <VChart
      v-if="xml"
      autoresize
      ref="chartRef"
      style="position: relative; width: 100%; min-height: 400px"
      :option="chartOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { ClimbDetector } from '@/lib/gpx/ClimbDetector';
import { GpxParse, smoothPointsByDistance } from '@/lib/gpx/GpxParse';
import { getAveragePace, getTotalDuration } from '@/lib/gpx/Metrics';
import { minutesToFormattedDuration, paceToNumber } from '@/lib/time';
import { GpxPoint } from '@/types/GpxPoint';
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
import { InputNumber } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import VChart from 'vue-echarts';
import InputPaceDuration from '../race/inputs/InputPaceDuration.vue';

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

const paceToKmh = (pace: number) => 60 / pace;
const kmhToPace = (kmh: number) => 60 / kmh;

const chartOptions2 = ref({
  tooltip: {
    trigger: 'axis',
    showContent: true,
    axisPointer: {
      type: 'line',
      snap: true,
    },
  },
  xAxis: {
    type: 'value',
    boundaryGap: false,
  },
  yAxis: [
    {
      type: 'value',
      position: 'left',
    },
  ],
  series: [],
});

const chartOptions = ref({
  tooltip: {
    trigger: 'axis',
    showContent: true,
    axisPointer: {
      type: 'line',
      snap: true,
    },
    formatter: (params: any[]) => {
      let distance = params[0].value[0];
      let elevation = null;
      let pace = null;

      params.forEach((p) => {
        if (p.seriesId === 'points') {
          elevation = p.value[1];
        }

        if (p.seriesId.includes('pace')) {
          const paceNumber = p.value[1];
          const min = Math.floor(paceNumber);
          const sec = Math.round((paceNumber - min) * 60);
          pace = `${min}:${sec.toString().padStart(2, '0')}/km`;
        }
      });

      return `
      <div style="padding:6px">
        <strong>${distance.toFixed(2)} km</strong><br/>
        ${elevation !== null ? `Élévation : ${elevation} m<br/>` : ''}
        ${pace !== null ? `Pace : ${pace}<br/>` : ''}
      </div>
    `;
    },
  },

  grid: { top: 100, right: 80, bottom: 50, left: 70 },
  xAxis: {
    type: 'value',
    boundaryGap: false,
  },
  yAxis: [
    {
      type: 'value',
      position: 'left',
      axisLabel: {
        formatter: (v: number) => (v % 100 === 0 ? `${v} m` : ''),
      },
    },
    {
      type: 'value',
      position: 'right',
      min: 0,
      max: 20,
      axisLabel: {
        formatter: (v: number) => {
          const minutes = Math.floor(v);
          const seconds = Math.round((v - minutes) * 60);
          return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
        },
      },
    },
  ],
  series: [],
});

const xml = ref<string>('');
const points = ref<GpxPoint[]>([]);
const separators = ref<number[]>([]);
const totalDistance = ref<number>();
const maxPace = ref<number>(5.5);
const minUpPace = ref<number>(15);
const minDownPace = ref<number>(9);
const pUp = ref<number>(0.5);
const pDown = ref<number>(2);
const sOpt = ref<number>(-3);
const avg = ref<string>('09:04');
const splits = ref<Split[]>([]);

const modelPoints = computed(() => {
  // const calculator = new PaceCalculator(points.value, totalDistance.value);
  // const sMax = calculator.sMax;
  // const sMin = calculator.sMin;
  // const vMax = paceToKmh(maxPace.value); // vitesse max (a pente optimale)
  // const vMinDown = paceToKmh(minDownPace.value); // vitesse minimum en descente
  // const vMinUp = paceToKmh(minUpPace.value); // vitesse minimum en montée
  // const model = calculator.createSpeedModel({
  //   vMax,
  //   sOpt: sOpt.value,
  //   pUp: pUp.value,
  //   pDown: pDown.value,
  //   sMin,
  //   vMinDown,
  //   sMax,
  //   vMinUp,
  // });
  // const arr = [];
  // for (let i = sMin; i <= sMax; i++) {
  //   arr.push(i);
  // }
  // return arr.map((num) => {
  //   return [num, kmhToPace(model(num))];
  // });
});

const modelSerie = computed(() => {
  return [
    {
      id: 'model',
      smooth: false,
      showSymbol: false,
      type: 'line',
      data: modelPoints.value,
      lineStyle: { color: 'orange', width: 1 },
    },
  ];
});

const finalAvg = computed(() => {
  return getAveragePace(splits.value, [], totalDistance.value);
});

const finalDuration = computed(() => {
  return minutesToFormattedDuration(getTotalDuration(splits.value, []));
});

function getIndexFromDistance(distance: number) {
  return points.value.findIndex((el) => el.distance >= distance);
}

function getPointsFromSplit(split: Partial<Split>) {
  const startIndex = getIndexFromDistance(split.startDistance);
  const endIndex = getIndexFromDistance(split.endDistance);
  return points.value.slice(startIndex, endIndex + 1);
}

const series = computed(() => {
  return [
    {
      id: 'separators',
      type: 'line',
      data: [],
      markLine: {
        animation: false,
        symbol: 'none',
        lineStyle: { color: '#024264', type: 'dashed', width: 1 },
        label: {
          show: true,
          rotate: 45,
          position: 'end',
          color: '#035581',
        },
        data: separators.value.map((sep: number) => ({
          xAxis: sep,
        })),
      },
    },
    {
      id: 'points',
      smooth: false,
      showSymbol: false,
      type: 'line',
      data: points.value.map((p) => [p.distance, p.elevation]),
      lineStyle: { color: 'grey', width: 2, opacity: 0.5 },
    },
    {
      id: 'avg',
      smooth: false,
      showSymbol: false,
      type: 'line',
      yAxisIndex: 1,
      data: points.value.map((p) => [p.distance, paceToNumber(avg.value)]),
      lineStyle: { color: 'blue', width: 2 },
    },
    ...splits.value.map((split) => {
      const points = getPointsFromSplit(split);
      const averagePace = paceToNumber(split.pace);
      const serie = {
        id: `pace-${split.startDistance}-${split.endDistance}`,
        type: 'line',
        symbol: 'rect',
        animation: false,
        itemStyle: {
          opacity: 0,
        },
        data: points.map((p) => [p.distance, averagePace]),
        smooth: false,
        showSymbol: false,
        yAxisIndex: 1,
      };
      return serie;
    }),
  ];
});

const calculate = () => {
  // splits.value = new PaceCalculator(xml.value).calculateSplitPace({
  //   splits: computeSplits(separators.value),
  //   avg: paceToNumber(avg.value),
  //   maxPace: maxPace.value,
  //   upMinPace: minUpPace.value,
  //   downMinPace: minDownPace.value,
  //   pUp: pUp.value,
  //   pDown: pDown.value,
  //   sOpt: sOpt.value,
  // });
  // updateChartData();
};

onMounted(async () => {
  const response = await fetch('/belfort.xml');
  const text = await response.text();
  xml.value = text;
  const parsed = new GpxParse(xml.value);
  points.value = smoothPointsByDistance(parsed.points, 1);
  separators.value = new ClimbDetector(text).separators;
  totalDistance.value = parsed.totalDistance;
  calculate();
  updateChartData();
});

watch([avg, maxPace, minDownPace, minUpPace, pUp, pDown, sOpt], () => {
  calculate();
});

const updateChartData = () => {
  chartOptions.value.series = [];
  chartOptions.value.series = [...series.value];
  chartOptions2.value.series = [...modelSerie.value];
};
</script>

<style lang="scss" scoped></style>
