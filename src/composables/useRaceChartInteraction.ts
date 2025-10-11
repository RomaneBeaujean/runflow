import { GpxPoint } from '@/domain/entities/DistanceElevation';
import { useGpxMetrics } from './useGpxMetrics';
import { useRace } from './useRace';

const { getMidPointFromSplit } = useGpxMetrics();
const { points, separators, splits } = useRace();

export default function useRaceChartInteraction({
  clickedPoint,
  clickedSeparatorPosition,
  hoveredSplitTooltipPosition,
  clickTooltipPosition,
  hoveredSplit,
  clickedSeparator,
}) {
  const getTargetDistance = (event: any, chartInstance: any) => {
    const [targetDistance] = chartInstance.convertFromPixel(
      { xAxisIndex: 0, yAxisIndex: 0 },
      [event.offsetX, event.offsetY]
    );
    return targetDistance;
  };

  const onChartHover = (event: any, chartInstance: any) => {
    const targetDistance = getTargetDistance(event, chartInstance);
    const targetSplit = splits.value.find(
      (s) =>
        targetDistance >= s.startDistance && targetDistance <= s.endDistance
    );
    if (!targetSplit) return;
    hoveredSplit.value = targetSplit;
    const midPoint = getMidPointFromSplit(targetSplit);
    const [px, py] = chartInstance.convertToPixel(
      { xAxisIndex: 0, yAxisIndex: 0 },
      [midPoint.distance, midPoint.elevation]
    );
    hoveredSplitTooltipPosition.value = { left: `${px}px`, top: `${py}px` };
  };

  const onChartClick = (event: any, chartInstance: any) => {
    closeTooltip();
    const targetDistance = getTargetDistance(event, chartInstance);
    if (!event.target) {
      closeTooltip();
      return;
    }
    if (event.target?.name === 'line') {
      const closest = getClosestSeparator(targetDistance);
      clickedSeparator.value = closest;
      const [px, py] = getPositionFromDistance(chartInstance, closest);
      clickedSeparatorPosition.value = { left: `${px}px`, top: `${py}px` };
    } else {
      const closest = getClosestGpxPoint(targetDistance);
      clickedPoint.value = closest;
      const [px, py] = getPositionFromPoint(chartInstance, closest);
      clickTooltipPosition.value = { left: `${px}px`, top: `${py}px` };
    }
  };

  const onChartLeave = () => {
    hoveredSplit.value = null;
    hoveredSplitTooltipPosition.value = null;
  };

  const closeTooltip = () => {
    clickedPoint.value = null;
    clickTooltipPosition.value = null;
    clickedSeparatorPosition.value = null;
    clickedSeparator.value = null;
  };

  return {
    clickedSeparator,
    clickedSeparatorPosition,
    clickedPoint,
    clickTooltipPosition,
    hoveredSplitTooltipPosition,
    hoveredSplit,
    onChartHover,
    onChartClick,
    onChartLeave,
    closeTooltip,
  };

  function getPositionFromDistance(
    chartInstance: any,
    distance: number
  ): [any, any] {
    return chartInstance.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [
      distance,
      0,
    ]);
  }

  function getPositionFromPoint(
    chartInstance: any,
    closest: GpxPoint
  ): [any, any] {
    return chartInstance.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [
      closest.distance,
      closest.elevation,
    ]);
  }

  function getClosestGpxPoint(targetDistance: any) {
    return points.value.reduce((prev: any, curr: any) =>
      Math.abs(curr.distance - targetDistance) <
      Math.abs(prev.distance - targetDistance)
        ? curr
        : prev
    );
  }

  function getClosestSeparator(targetDistance: any) {
    return separators.value.reduce((prev: any, curr: any) =>
      Math.abs(curr - targetDistance) < Math.abs(prev - targetDistance)
        ? curr
        : prev
    );
  }
}
