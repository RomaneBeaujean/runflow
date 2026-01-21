import { GpxPoint } from '@/domain/types/GpxPoint';
import { BarChart, CustomChart, LineChart } from 'echarts/charts';
import {
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, ref } from 'vue';

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
  CustomChart,
  TitleComponent,
  MarkLineComponent,
  MarkPointComponent,
  MarkAreaComponent,
  GraphicComponent,
]);

const chartRef = ref(null);

const chartInstance = computed(() => {
  return chartRef.value?.chart || null;
});

export function useEcharts() {
  const getTargetDistance = (event: any) => {
    const [targetDistance] = chartInstance.value.convertFromPixel(
      { xAxisIndex: 0, yAxisIndex: 0 },
      [event.offsetX, event.offsetY]
    );
    return targetDistance;
  };

  const getTargetDistancePace = (event: any) => {
    const [distance, pace] = chartInstance.value.convertFromPixel(
      { xAxisIndex: 0, yAxisIndex: 1 },
      [event.offsetX, event.offsetY]
    );
    return { distance, pace };
  };

  const getTargetDistanceSeparator = (event: any) => {
    const [distance, elevation] = chartInstance.value.convertFromPixel(
      { xAxisIndex: 0, yAxisIndex: 0 },
      [event.offsetX, event.offsetY]
    );
    return { distance, elevation };
  };

  const getPositionFromDistance = (distance: number) => {
    const [x, y] = chartInstance.value.convertToPixel(
      { xAxisIndex: 0, yAxisIndex: 0 },
      [distance, 0]
    );
    return { x, y };
  };

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
    getTargetDistancePace,
    getTargetDistanceSeparator,
    getTargetDistance,
  };
}
