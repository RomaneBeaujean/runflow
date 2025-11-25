import { useEcharts } from '@/composables/useEcharts';
import { useRaceChartParams } from '@/composables/useRaceChartParams';
import { useRaceMetrics } from '@/composables/useRaceMetrics';
import { useViewport } from '@/composables/useViewport';
import { numberToPace } from '@/lib/time';
import { roundOneNumber } from '@/lib/utils';
import { GpxPoint } from '@/types/GpxPoint';
import { Position } from '@/types/Position';
import { Separator } from '@/types/entities/Separator';
import { computed, ref } from 'vue';
import { useRace } from './useRace';

const { updateSplitPace, updateSeparator } = useRace();

const { getClosestPoint, getClosestSeparator, getSplitFromDistance } =
  useRaceMetrics();
const {
  getTargetDistance,
  getPositionFromDistance,
  getPositionFromPoint,
  getTargetDistanceSeparator,
  getTargetDistancePace,
  chartInstance,
} = useEcharts();

const { isMobile } = useViewport();
const { editableMode, showPaceLine } = useRaceChartParams();
const clickedPoint = ref<GpxPoint | null>(null);
const clickedPointPosition = ref<Position | null>(null);
const clickedSeparator = ref<Separator | null>(null);
const clickedSeparatorPosition = ref<Position | null>(null);
const dragPaceDistance = ref<number>(null);
const dragPaceValue = ref<number>(null);
const dragSeparator = ref<Separator>(null);
const dragSeparatorDistance = ref<number>(null);

export default function useRaceChartInteraction() {
  const zr = computed(() => chartInstance.value.getZr());

  const onChartClick = (event: any) => {
    if (!editableMode.value || isMobile.value) return;
    closeTooltip();

    const targetDistance = getTargetDistance(event);

    if (!event.target) return;
    if (event.target?.name === 'line') {
      const closest = getClosestSeparator(targetDistance);
      if (!closest) return;
      clickedSeparator.value = closest;
      const [x, y] = getPositionFromDistance(closest.distance);
      clickedSeparatorPosition.value = { left: `${x}px`, top: `${y}px` };
    } else {
      const closest = getClosestPoint(targetDistance);
      const [px, py] = getPositionFromPoint(closest);
      clickedPoint.value = closest;
      clickedPointPosition.value = { left: `${px}px`, top: `${py}px` };
    }
  };

  const onChartMouseDown = (event: any) => {
    if (!editableMode.value || isMobile.value) return;
    const el = event.target;
    if (!el) return;

    if (el.cursor == 'row-resize' && showPaceLine.value) {
      const [x, y] = getTargetDistancePace(event);
      dragPaceDistance.value = x;
      dragPaceValue.value = y;
      zr.value.on('mousemove', onPaceMouseMove);
      zr.value.on('mouseup', onPaceMouseUp);
    }

    if (el.cursor == 'col-resize') {
      const [x, y] = getTargetDistanceSeparator(event);
      dragSeparator.value = getClosestSeparator(x);
      dragSeparatorDistance.value = roundOneNumber(x);
      zr.value.on('mousemove', onSeparatorMouseMove);
      zr.value.on('mouseup', onSeparatorMouseUp);
    }
  };

  const onPaceMouseUp = (event: any) => {
    zr.value.off('mousemove', onPaceMouseMove);
    zr.value.off('mouseup', onPaceMouseUp);
    const [x, y] = getTargetDistancePace(event);
    const split = getSplitFromDistance(x);
    updateSplitPace(split, numberToPace(y));
    dragPaceDistance.value = null;
    dragPaceValue.value = null;
  };

  const onSeparatorMouseUp = (event: any) => {
    zr.value.off('mousemove', onSeparatorMouseMove);
    zr.value.off('mouseup', onSeparatorMouseUp);
    const newSeparator = {
      ...dragSeparator.value,
      distance: roundOneNumber(dragSeparatorDistance.value),
    };
    updateSeparator(dragSeparator.value, newSeparator);
  };

  const onPaceMouseMove = (event: any) => {
    const [x, y] = getTargetDistancePace(event);
    dragPaceValue.value = y;
  };

  const onSeparatorMouseMove = (event: any) => {
    const [x] = getTargetDistanceSeparator(event);
    dragSeparatorDistance.value = roundOneNumber(x);
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
    dragPaceDistance,
    dragSeparatorDistance,
    dragPaceValue,
    dragSeparator,
    onChartClick,
    onChartMouseDown,
    closeTooltip,
  };
}
