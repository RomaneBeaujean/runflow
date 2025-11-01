import { GpxPoint } from '@/types/GpxPoint';
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
  VisualMapComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, ref } from 'vue';

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
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
    getTargetDistance,
  };
}
