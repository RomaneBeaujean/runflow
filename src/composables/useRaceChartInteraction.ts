import { GpxPoint } from '@/types/GpxPoint';
import { Separator } from '@/types/Separator';
import { Split } from '@/types/Split';
import { computed } from 'vue';
import { useGpxMetrics } from './useGpxMetrics';
import { useRace } from './useRace';
import useRaceHoveredSplit from './useRaceHoveredSplit';

const { getMidPointFromSplit } = useGpxMetrics();
const { points, separators, splits } = useRace();
const { hoveredSplit, setHoveredSplit, setHoveredSplitTooltipPosition } =
  useRaceHoveredSplit();

export default function useRaceChartInteraction({
  clickedPoint,
  clickedSeparatorPosition,
  clickTooltipPosition,
  clickedSeparator,
}) {
  // =========================
  // Préparer tableaux triés pour recherche binaire
  // =========================
  const sortedSplits = computed(() =>
    [...splits.value].sort((a, b) => a.startDistance - b.startDistance)
  );

  const sortedPoints = computed(() =>
    [...points.value].sort((a, b) => a.distance - b.distance)
  );

  const sortedSeparators = computed(() =>
    [...separators.value].sort((a, b) => a.distance - b.distance)
  );

  // =========================
  // Fonctions utilitaires
  // =========================
  const getTargetDistance = (event: any, chartInstance: any) => {
    const [targetDistance] = chartInstance.convertFromPixel(
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

  const getPositionFromDistance = (chartInstance: any, distance: number) =>
    chartInstance.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [
      distance,
      0,
    ]);

  const getPositionFromPoint = (chartInstance: any, point: GpxPoint) =>
    chartInstance.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [
      point.distance,
      point.elevation,
    ]);

  // =========================
  // Hover sur chart
  // =========================
  const onChartHover = (event: any, chartInstance: any) => {
    const targetDistance = getTargetDistance(event, chartInstance);

    const targetSplit = getSplitFromDistance(targetDistance);
    if (!targetSplit) {
      setHoveredSplit(null);
      setHoveredSplitTooltipPosition(null);
      return;
    }

    // Mise à jour seulement si changement
    if (
      !hoveredSplit.value ||
      hoveredSplit.value.startDistance !== targetSplit.startDistance
    ) {
      setHoveredSplit(targetSplit);

      const midPoint = getMidPointFromSplit(targetSplit);
      const [px, py] = chartInstance.convertToPixel(
        { xAxisIndex: 0, yAxisIndex: 0 },
        [midPoint.distance, midPoint.elevation]
      );

      setHoveredSplitTooltipPosition({ left: `${px}px`, top: `${py}px` });
    }
  };

  // =========================
  // Click sur chart
  // =========================
  const onChartClick = (event: any, chartInstance: any) => {
    closeTooltip();

    const targetDistance = getTargetDistance(event, chartInstance);
    if (!event.target) return;

    if (event.target?.name === 'line') {
      const closest = getClosestSeparator(targetDistance);
      clickedSeparator.value = closest;
      if (closest) {
        const [px, py] = getPositionFromDistance(
          chartInstance,
          closest.distance
        );
        clickedSeparatorPosition.value = { left: `${px}px`, top: `${py}px` };
      }
    } else {
      const closest = getClosestPoint(targetDistance);
      clickedPoint.value = closest;
      const [px, py] = getPositionFromPoint(chartInstance, closest);
      clickTooltipPosition.value = { left: `${px}px`, top: `${py}px` };
    }
  };

  // =========================
  // Sortie du chart
  // =========================
  const onChartLeave = () => {
    setHoveredSplit(null);
    setHoveredSplitTooltipPosition(null);
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
    onChartHover,
    onChartClick,
    onChartLeave,
    closeTooltip,
  };
}
