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
    const targetDistance = getTargetDistance(event);
    if (!editableMode.value || isMobile.value || !targetDistance) return;

    closeTooltip();

    const isSeparatorClick = event.target
      ? ['path', 'tspan', 'rect', 'ec-line'].includes(event.target.type)
      : false;

    if (isSeparatorClick) {
      handleSeparatorClick(targetDistance);
    } else {
      handleChartClick(targetDistance);
    }
  };

  const onChartMouseDown = (event: any) => {
    if (!editableMode.value || isMobile.value) return;
    closeTooltip();
    const el = event.target;
    if (!el) return;
    if (el.cursor == 'row-resize' && showPaceLine.value) initPaceDrag(event);
    if (el.cursor == 'col-resize') initSeparatorDrag(event);
  };

  /**
   * CHART CLICK
   */

  const handleChartClick = (targetDistance: number) => {
    const closest = getClosestPoint(targetDistance);
    const [px, py] = getPositionFromPoint(closest);
    clickedPoint.value = closest;
    clickedPointPosition.value = { left: `${px}px`, top: `${py}px` };
  };

  /**
   * SEPARATOR CLICK
   */

  const handleSeparatorClick = (targetDistance: number) => {
    const separator = getClosestSeparator(targetDistance);
    clickedSeparator.value = separator;
    const { x } = getPositionFromDistance(separator.distance);
    clickedSeparatorPosition.value = {
      left: `${x}px`,
      top: `50px`,
    };
  };
  const closeTooltip = () => {
    clickedPoint.value = null;
    clickedPointPosition.value = null;
    clickedSeparatorPosition.value = null;
    clickedSeparator.value = null;
  };

  /**
   * PACE DRAG
   */

  const initPaceDrag = (event: any) => {
    const { distance, pace } = getTargetDistancePace(event);
    dragPaceDistance.value = distance;
    dragPaceValue.value = pace;
    zr.value.on('mousemove', onPaceMouseMove);
    zr.value.on('mouseup', onPaceMouseUp);
  };

  const onPaceMouseMove = (event: any) => {
    const { pace } = getTargetDistancePace(event);
    dragPaceValue.value = pace;
  };

  const onPaceMouseUp = (event: any) => {
    zr.value.off('mousemove', onPaceMouseMove);
    zr.value.off('mouseup', onPaceMouseUp);
    const { distance, pace } = getTargetDistancePace(event);
    if (dragPaceDistance.value && dragPaceValue.value) {
      const split = getSplitFromDistance(distance);
      updateSplitPace(split, numberToPace(pace));
    }
    dragPaceDistance.value = null;
    dragPaceValue.value = null;
  };
  /**
   * SEPARATOR DRAG
   */

  const initSeparatorDrag = (event: any) => {
    const { distance } = getTargetDistanceSeparator(event);
    dragSeparator.value = getClosestSeparator(distance);
    zr.value.on('mousemove', onSeparatorMouseMove);
    zr.value.on('mouseup', onSeparatorMouseUp);
  };

  const onSeparatorMouseMove = (event: any) => {
    const { distance } = getTargetDistanceSeparator(event);
    dragSeparatorDistance.value = roundOneNumber(distance);
  };

  const onSeparatorMouseUp = () => {
    zr.value.off('mousemove', onSeparatorMouseMove);
    zr.value.off('mouseup', onSeparatorMouseUp);
    if (dragSeparatorDistance.value && dragSeparator.value) {
      const newSeparator = {
        ...dragSeparator.value,
        distance: roundOneNumber(dragSeparatorDistance.value),
      };
      updateSeparator(dragSeparator.value, newSeparator);
    }
    dragSeparator.value = null;
    dragSeparatorDistance.value = null;
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
