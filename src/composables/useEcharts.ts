// src/ui/composables/useRaceChartEcharts.ts
import { GpxPoint } from '@/types/GpxPoint';
import { Separator } from '@/types/Separator';
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
import { computed, ref } from 'vue';
import { useRace } from './useRace';

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

const { points, separators, splits } = useRace();

const chartRef = ref(null);

const chartInstance = computed(() => {
  return chartRef.value?.chart || null;
});

export function useEcharts() {
  const sortedSplits = computed(() =>
    [...splits.value].sort((a, b) => a.startDistance - b.startDistance)
  );

  const sortedPoints = computed(() =>
    [...points.value].sort((a, b) => a.distance - b.distance)
  );

  const sortedSeparators = computed(() =>
    [...separators.value].sort((a, b) => a.distance - b.distance)
  );

  const getTargetDistance = (event: any) => {
    const [targetDistance] = chartInstance.value.convertFromPixel(
      { xAxisIndex: 0, yAxisIndex: 0 },
      [event.offsetX, event.offsetY]
    );
    return targetDistance;
  };

  const getSplitFromDistance = (distance: number): Split | null => {
    let left = 0;
    let right = sortedSplits.value.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const split = sortedSplits.value[mid];
      if (distance < split.startDistance) right = mid - 1;
      else if (distance > split.endDistance) left = mid + 1;
      else return split;
    }
    return null;
  };

  const getClosestPoint = (targetDistance: number): GpxPoint => {
    let left = 0,
      right = sortedPoints.value.length - 1;
    let closest = sortedPoints.value[0];
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midPoint = sortedPoints.value[mid];
      if (
        Math.abs(midPoint.distance - targetDistance) <
        Math.abs(closest.distance - targetDistance)
      ) {
        closest = midPoint;
      }
      if (midPoint.distance < targetDistance) left = mid + 1;
      else right = mid - 1;
    }
    return closest;
  };

  const getClosestSeparator = (targetDistance: number): Separator | null => {
    if (sortedSeparators.value.length === 0) return null;
    let left = 0,
      right = sortedSeparators.value.length - 1;
    let closest = sortedSeparators.value[0];
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midSep = sortedSeparators.value[mid];
      if (
        Math.abs(midSep.distance - targetDistance) <
        Math.abs(closest.distance - targetDistance)
      ) {
        closest = midSep;
      }
      if (midSep.distance < targetDistance) left = mid + 1;
      else right = mid - 1;
    }
    return closest;
  };

  const getPositionFromDistance = (distance: number) =>
    chartInstance.value.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [
      distance,
      0,
    ]);

  const getPositionFromPoint = (point: GpxPoint) =>
    chartInstance.value.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [
      point.distance,
      point.elevation,
    ]);

  return {
    chartRef,
    chartInstance,
    getPositionFromPoint,
    getPositionFromDistance,
    getClosestSeparator,
    getClosestPoint,
    getSplitFromDistance,
    getTargetDistance,
  };
}
