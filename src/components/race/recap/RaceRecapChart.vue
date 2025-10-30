<template>
  <div id="recap" style="height: 800px; width: 2000px">
    <VChart ref="recapChartRef" :option="chartOptions" autoresize="" />
  </div>
</template>

<script setup lang="ts">
import { useRace } from '@/composables/Race/useRace';
import { useRaceMetrics } from '@/composables/Race/useRaceMetrics';
import { getSlopeColors } from '@/lib/gpx/slope';
import { minutesToFormattedDuration } from '@/lib/time';
import { roundOneNumber } from '@/lib/utils';
import { Separator } from '@/types/entities/Separator';
import { Split } from '@/types/Split';
import { LineChart } from 'echarts/charts';
import {
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, onMounted, ref, watch } from 'vue';
import VChart from 'vue-echarts';

export interface RecapChartParams {
  time: boolean;
  totalDuration: boolean;
  splitPace: boolean;
  splitDuration: boolean;
  splitElevation: boolean;
  splitSlope: boolean;
}

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  MarkLineComponent,
  MarkPointComponent,
  MarkAreaComponent,
  GraphicComponent,
]);

const {
  getPointsFromSplit,
  getSplitSlopePercent,
  getSplitElevation,
  getSplitNegativeElevation,
  getCumulDurationToDistance,
  getSplitDuration,
  getFormattedTimeToDistance,
} = useRaceMetrics();

const { totalDistance, splits, separators } = useRace();

const props = defineProps<{ params: RecapChartParams }>();
const recapChartRef = ref(null);

const splitMarkArea = (split: Split) => {
  if (!split) return [];

  const positive = getSplitElevation(split);
  const negative = getSplitNegativeElevation(split);
  const elevation =
    Math.abs(positive) > Math.abs(negative)
      ? `+${positive} m`
      : `-${negative} m`;

  const { color, background } = getSlopeColors(
    getSplitSlopePercent(split).major
  );

  const maxY = Math.max(...getPointsFromSplit(split).map((el) => el.elevation));

  const splitDuration = minutesToFormattedDuration(getSplitDuration(split));

  return [
    // Split Pace
    [
      {
        xAxis: split.startDistance,
        label: {
          position: 'insideBottom',
          color: '#61325c',
          offset: props.params.time ? [0, -25] : [],
          backgroundColor: '#F4F0F8BF',
          formatter: () =>
            props.params.splitPace ? `{b|${split.pace}}\n{s|min/km}` : '',
        },
      },
      {
        xAxis: split.endDistance,
      },
    ],
    // Split Duration
    [
      {
        xAxis: split.startDistance,
        label: {
          position: 'insideTop',
          color: '#075985',
          offset: [0, 25],
          backgroundColor: '#EFF6FFBF',
          formatter: () =>
            props.params.splitDuration ? `{b|${splitDuration}}` : '',
        },
      },
      {
        xAxis: split.endDistance,
      },
    ],
    // Distance du split
    [
      {
        xAxis: split.startDistance,
        label: {
          position: 'insideTop',
          color: '#0C4A6E',
          backgroundColor: '#F0F9FFBF',
          formatter: () =>
            `{b|${roundOneNumber(split.endDistance - split.startDistance)}} {s|km}`,
        },
      },
      {
        xAxis: split.endDistance,
      },
    ],
    // Dénivelé du split
    [
      {
        xAxis: split.startDistance,
        yAxis: 0,
        label: {
          position: 'inside',
          color,
          fontWeight: 'bold',
          rotate: 0,
          backgroundColor: `${background}BF`,
          formatter: () =>
            props.params.splitElevation && props.params.splitSlope
              ? `${elevation}\n${getSplitSlopePercent(split).major}%`
              : props.params.splitElevation
                ? `${elevation}`
                : props.params.splitSlope
                  ? `${getSplitSlopePercent(split).major}%`
                  : '',
        },
      },
      {
        xAxis: split.endDistance,
      },
    ],
  ];
};

const splitsSeries = computed(() => {
  const AREA_LINE_COLOR = '#155E75';
  const AREA_COLOR = '#EFF6FF';

  return splits.value.map((split) => {
    const points = getPointsFromSplit(split);
    const serie = {
      id: `serie-${split.startDistance}-${split.endDistance}`,
      type: 'line',
      data: points.map((p) => [p.distance, p.elevation]),
      smooth: true,
      showSymbol: false,
      lineStyle: { color: AREA_LINE_COLOR, width: 2 },
      areaStyle: { color: AREA_COLOR, opacity: 1 },

      markArea: {
        zlevel: 1,
        silent: true,
        itemStyle: { color: 'transparent' },
        label: {
          show: true,
          rich: {
            b: { fontWeight: 'bold' },
            s: { fontSize: '8px' },
          },
          lineHeight: 14,
          fontSize: 12,
          borderRadius: 4,
          padding: 4,
        },
        data: splitMarkArea(split),
      },
    };

    return serie;
  });
});

const chartSeparators = computed(() => {
  return separators.value.filter((s) => {
    return s.distance !== totalDistance.value;
  });
});

const markareaTotalDuration = computed(() => {
  if (!props.params.totalDuration) return [];
  return chartSeparators.value.map((sep: Separator) => [
    {
      xAxis: sep.distance,
      yAxis: 0,
      label: {
        position: 'bottom',
        color: '#054b3a',
        fontWeight: 'bold',
        offset: [-35, 10],
        rotate: 45,
        backgroundColor: '#e7f7f3',
        formatter: () =>
          `${minutesToFormattedDuration(getCumulDurationToDistance(sep.distance))}`,
      },
    },
    {
      xAxis: sep.distance,
      yAxis: 0,
    },
  ]);
});

const markareaTime = computed(() => {
  if (!props.params.time) return [];
  return chartSeparators.value.map((sep: Separator) => [
    {
      xAxis: sep.distance,
      yAxis: 0,
      label: {
        position: 'insideBottom',
        color: '#054b3a',
        fontWeight: 'bold',
        backgroundColor: '#e7f7f3',
        formatter: () => `${getFormattedTimeToDistance(sep.distance)}`,
      },
    },
    {
      xAxis: sep.distance,
      yAxis: 0,
    },
  ]);
});

const separatorsSeries = computed(() => {
  return {
    id: 'separators',
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
        fontWeight: 'bold',
        fontSize: 11,
        backgroundColor: '#B1D5E8',
        padding: 4,
        rotate: 45,
        offset: [20, 10],
        borderRadius: 4,
        rich: {
          xs: { fontSize: 8 },
        },
        formatter: (params: any) => `${params.value} {xs|km} `,
      },
      data: chartSeparators.value.map((sep: Separator) => ({
        xAxis: sep.distance,
        label: {
          color: sep.refuel ? '#C026D3' : '#035581',
          backgroundColor: sep.refuel ? '#F5D0FE' : '#B1D5E8',
        },
        lineStyle: {
          color: sep.refuel ? '#C026D3' : '#035581',
          width: 1,
        },
      })),
    },
    markArea: {
      zlevel: 1,
      silent: true,
      itemStyle: { color: 'transparent' },
      label: {
        show: true,
        rich: {
          b: { fontWeight: 'bold' }, // style pour "bold"
        },
        fontSize: 12,
        borderRadius: 4,
        padding: 4,
      },
      data: [...markareaTotalDuration.value, ...markareaTime.value],
    },
  };
});

const chartOptions = ref({
  grid: {
    top: 50,
    right: 16,
    bottom: 60,
    left: 8,
  },
  xAxis: {
    type: 'value',
    boundaryGap: false,
    min: 0,
    max: totalDistance ?? 0,
  },
  yAxis: {
    type: 'value',
    show: true,
    axisLabel: { formatter: (v: number) => (v % 100 === 0 ? `${v} m` : '') },
  },
  series: [],
});

const updateChartData = () => {
  chartOptions.value.series = [...splitsSeries.value, separatorsSeries.value];
};

onMounted(() => {
  updateChartData();
});

watch(props.params, () => {
  updateChartData();
});
</script>

<style scoped lang="scss">
#recap {
  background: white;
  padding: 8px;
  font-size: 12px;
}

.table {
  display: table;
  border-collapse: collapse;
  table-layout: auto;
  border-collapse: collapse;
  width: max-content; /* optionnel, et très utile */
}

.header {
  display: table-cell;
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;
  vertical-align: middle;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
}

.row {
  display: table-row;
}

.cell {
  display: table-cell;
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;
  vertical-align: middle;
  text-align: center;
  font-size: 14px;
}

.xsmall {
  font-size: 10px;
}
</style>
