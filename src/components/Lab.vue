<template>
  <div>
    <FileUpload
      name="gpx"
      accept=".gpx"
      mode="basic"
      :customUpload="true"
      auto
      chooseLabel="Choisir un fichier GPX"
      @select="addFile"
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
import { useGpxParser } from '@/composables/useGpxParser';
import { computeSeparators } from '@/lib/climbPasPro';
import { GpxPoint } from '@/types/GpxPoint';
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
import { FileUpload, FileUploadSelectEvent } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import VChart from 'vue-echarts';

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

const chartOptions = ref({
  tooltip: {
    trigger: 'axis',
    showContent: false,
    axisPointer: {
      type: 'line',
      snap: true,
      label: {
        show: true,
        backgroundColor: '#035581',
        color: '#fff',
        formatter: (params: any) => {
          const distance = params.value;
          return `${distance} km`;
        },
      },
    },
  },
  grid: { top: 100, right: 80, bottom: 50, left: 70 },
  xAxis: {
    type: 'value',
    boundaryGap: false,
  },
  yAxis: {
    type: 'value',
    axisLabel: { formatter: (v: number) => (v % 100 === 0 ? `${v} m` : '') },
  },
  series: [],
});

const xml = ref<string>('');
const points = ref<GpxPoint[]>([]);
const separators1 = ref<number[]>([]);
const separators2 = ref<number[]>([]);
const series = computed(() => {
  return [
    {
      id: 'exact-points',
      smooth: false,
      showSymbol: false,
      type: 'line',
      data: points.value.map((p) => [p.distance, p.elevation]),
      lineStyle: { color: 'grey', width: 1 },
    },
  ];
});

const separatorsSeries = computed(() => {
  return [
    {
      id: 'separators1',
      type: 'line',
      data: [],
      markLine: {
        animation: false,
        symbol: 'none',
        lineStyle: { color: '#024264', type: 'dashed', width: 1 },
        label: {
          show: true,
          position: 'end',
          color: '#035581',
        },
        data: separators1.value.map((sep: number) => ({
          xAxis: sep,
        })),
      },
    },
    {
      id: 'separators2',
      type: 'line',
      data: [],
      markLine: {
        animation: false,
        symbol: 'none',
        lineStyle: { color: 'red', width: 1 },
        label: {
          show: true,
          position: 'start',
          color: 'red',
        },
        data: separators2.value?.map((sep: number) => ({
          xAxis: sep,
        })),
      },
    },
  ];
});

onMounted(async () => {
  const response = await fetch('/ventoux.xml');
  const text = await response.text();
  xml.value = text;
  const { gpxexactpoints } = useGpxParser(text);
  points.value = gpxexactpoints;
  separators1.value = computeSeparators(points.value, 10, 0.05, 0.5);
  // separators2.value = computeSeparators2(points.value, 10, 0.1, 0.2);
  // console.log('sep-2', separators2.value);
  updateChartData();
});

const addFile = async (event: FileUploadSelectEvent) => {
  const uploadedFile = event.files[0];
  if (!uploadedFile) return;

  const content = await uploadedFile.text();
  xml.value = content;
};

watch(xml, () => {
  // points.value = useGpxParser(xml.value).gpxexactpoints;
  // separators1.value = computeSeparators(points.value);
  // separators2.value = computeSeparators2(points.value);
  // updateChartData();
});

const updateChartData = () => {
  chartOptions.value.series = [];
  chartOptions.value.series = [...series.value, ...separatorsSeries.value];
};
</script>

<style lang="scss" scoped></style>
