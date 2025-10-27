import { GpxPoint } from '@/types/GpxPoint';
import { Position } from '@/types/Position';
import { Separator } from '@/types/entities/Separator';
import { ref } from 'vue';
import { useEcharts } from './useEcharts';
import { useRaceFilters } from './useRaceFilters';

const {
  getTargetDistance,
  getClosestSeparator,
  getPositionFromDistance,
  getClosestPoint,
  getPositionFromPoint,
} = useEcharts();

const { editableMode } = useRaceFilters();
const clickedPoint = ref<GpxPoint | null>(null);
const clickedPointPosition = ref<Position | null>(null);
const clickedSeparator = ref<Separator | null>(null);
const clickedSeparatorPosition = ref<Position | null>(null);

export default function useRaceChartClick() {
  const onChartClick = (event: any) => {
    if (!editableMode.value) return;
    closeTooltip();

    const targetDistance = getTargetDistance(event);
    if (!event.target) return;
    if (event.target?.name === 'line') {
      const closest = getClosestSeparator(targetDistance);
      if (!closest) return;
      clickedSeparator.value = closest;
      const [px, py] = getPositionFromDistance(closest.distance);
      clickedSeparatorPosition.value = { left: `${px}px`, top: `${py}px` };
    } else {
      const closest = getClosestPoint(targetDistance);
      const [px, py] = getPositionFromPoint(closest);
      clickedPoint.value = closest;
      clickedPointPosition.value = { left: `${px}px`, top: `${py}px` };
    }
  };

  const closeTooltip = () => {
    clickedPoint.value = null;
    clickedPointPosition.value = null;
    clickedSeparatorPosition.value = null;
    clickedSeparator.value = null;
  };

  return {
    clickedPoint,
    clickedPointPosition,
    clickedSeparator,
    clickedSeparatorPosition,
    onChartClick,
    closeTooltip,
  };
}
