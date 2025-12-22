<template>
  <VChart
    autoresize
    ref="automaticPaceChartRef"
    class="h-full"
    :option="chartOptions"
  />
</template>

<script setup lang="ts">
import { getAveragePace } from '@/domain/GpxMetrics';
import { getMarkLineColorStops, getPaceColor } from '@/domain/PaceColors';
import { getSlopeColors } from '@/domain/Slopes';
import { numberToPace, paceToNumber } from '@/domain/helpers/Time.helper';
import { GpxPoint } from '@/types/GpxPoint';
import { SlidingSlopePoint } from '@/types/Slope';
import { Split } from '@/types/Split';
import { useViewport } from '@/ui/composables/useViewport';
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

const props = defineProps<{
  splits: Split[];
  points: GpxPoint[];
  slidingSlopesPoints: SlidingSlopePoint[];
}>();

const { isMobile } = useViewport();

const totalDistance = computed(() => {
  if (props.splits.length == 0) return 0;
  return props.splits[props.splits.length - 1].endDistance;
});

const finalPaces = computed(() => {
  const paces = props.splits.map((it) => paceToNumber(it.pace));
  return {
    max: Math.max(...paces),
    min: Math.min(...paces),
  };
});

const averagePace = computed(() => {
  return getAveragePace(props.splits, []);
});

const series = computed(() => {
  return [
    {
      id: 'points',
      smooth: false,
      showSymbol: false,
      type: 'line',
      data: props.points.map((p) => [p.distance, p.elevation]),
      lineStyle: { color: '#DEDEDE', width: 1 },
      areaStyle: { color: '#DEDEDE' },
      emphasis: {
        disabled: true,
      },
    },
    ...props.splits.map((split, index) => {
      const points = getPointsFromSplit(split);
      const currentPace = paceToNumber(split.pace);
      const paceColor = getPaceColor(
        currentPace,
        paceToNumber(averagePace.value),
        finalPaces.value.min,
        finalPaces.value.max
      );
      const nextSplit =
        index == props.splits.length - 1 ? null : props.splits[index + 1];
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
          width: isMobile.value ? 1 : 3,
        },
        markLine: {
          yAxisIndex: 1,
          animation: false,
          symbol: 'none',
          silent: true,
          lineStyle: {
            width: isMobile.value ? 1 : 3,
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
                paceToNumber(averagePace.value),
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
  return [
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
  ];
});

const grid = computed(() => {
  return {
    top: 40,
    right: 16,
    bottom: isMobile.value ? 0 : 60,
    left: 8,
  };
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
  grid: grid.value,
  xAxis: {
    type: 'value',
    boundaryGap: false,
    min: 0,
    max: totalDistance ?? 0,
  },
  yAxis: yAxis.value,
  series: [],
});

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
  return props.points.findIndex((el) => el.distance >= distance);
}

function getPointsFromSplit(split: Partial<Split>) {
  const startIndex = getIndexFromDistance(split.startDistance);
  const endIndex = getIndexFromDistance(split.endDistance);
  return props.points.slice(startIndex, endIndex + 1);
}

function getSlopeFromDistance(targetDistance: number): number {
  const closestPoint = props.slidingSlopesPoints.find(
    (el) => el.distance >= targetDistance
  );
  return closestPoint?.slope || 0;
}

const updateChartData = () => {
  const options = {
    ...chartOptions.value,
    grid: grid.value,
    yAxis: yAxis.value,
    series: [...series.value],
  };
  chartOptions.value = options;
};

onMounted(() => {
  updateChartData();
});

watch(props, () => {
  updateChartData();
});
</script>

<style lang="scss"></style>
