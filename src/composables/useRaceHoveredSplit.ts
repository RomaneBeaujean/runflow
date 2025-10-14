import { useRace } from '@/composables/useRace';
import { Position } from '@/types/Position';
import { Split } from '@/types/Split';
import { TableRowItem } from '@/types/TableRowItem';
import { ref, watch } from 'vue';
import { useEcharts } from './useEcharts';
import { useGpxMetrics } from './useGpxMetrics';

const { splits } = useRace();
const clickedRow = ref<TableRowItem | null>(null);
const hoveredSplit = ref<Split | null>(null);
const hoveredSplitTooltipPosition = ref<Position | null>(null);
const hoveredRowDistance = ref<number>(null);
const { chartInstance } = useEcharts();
const { getMidPointFromSplit } = useGpxMetrics();
const { getTargetDistance, getSplitFromDistance } = useEcharts();

export default function useRaceHoveredSplit() {
  const setHoveredSplit = (value: Split | null) => {
    hoveredSplit.value = value;
  };

  const setHoveredSplitTooltipPosition = (position: Position) => {
    hoveredSplitTooltipPosition.value = position;
  };

  const onChartHover = (event: any) => {
    const targetDistance = getTargetDistance(event);
    const targetSplit = getSplitFromDistance(targetDistance);
    if (!targetSplit) return;
    if (clickedRow.value) return;
    setHoveredSplit(targetSplit);
  };

  const onChartLeave = () => {
    if (clickedRow.value) return;
    setHoveredSplit(null);
  };

  const onTableMouseEnter = (e: MouseEvent) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (!e.target.classList.contains('race-table-row')) return;
    const distanceString = Array.from(e.target.classList)
      .find((c) => c.includes('distance-'))
      ?.replace('distance-', '');
    if (!distanceString) return;
    const distance = Number(distanceString);
    hoveredRowDistance.value = distance;
  };

  const listenTableMouseEnter = () => {
    document.addEventListener('mouseenter', onTableMouseEnter, true);
  };

  const removeListeners = () => {
    document.removeEventListener('mouseenter', onTableMouseEnter, true);
  };

  const setTableClickedRow = (event: any) => {
    const { data } = event;
    if (clickedRow.value && clickedRow.value.distance == data.distance) {
      clickedRow.value = null;
    } else {
      clickedRow.value = data;
    }
  };

  watch(clickedRow, () => {
    if (!clickedRow.value) return;
    const distance = clickedRow.value.distance;
    if (distance === 0) return;
    const split = splits.value.find((el) => el.endDistance === distance);
    if (!split) return;

    setHoveredSplit(split);
  });

  watch(hoveredRowDistance, () => {
    if (clickedRow.value) return;
    const split = splits.value.find(
      (el) => el.endDistance === hoveredRowDistance.value
    );
    if (!split) return;
    setHoveredSplit(split);
  });

  watch(hoveredSplit, () => {
    if (!hoveredSplit.value) {
      setHoveredSplitTooltipPosition(null);
      return;
    }
    const midPoint = getMidPointFromSplit(hoveredSplit.value);
    const [px, py] = chartInstance.value.convertToPixel(
      { xAxisIndex: 0, yAxisIndex: 0 },
      [midPoint.distance, midPoint.elevation]
    );

    setHoveredSplitTooltipPosition({ left: `${px}px`, top: `${py}px` });
  });

  return {
    hoveredSplit,
    hoveredSplitTooltipPosition,
    onChartLeave,
    setTableClickedRow,
    listenTableMouseEnter,
    removeListeners,
    onChartHover,
    setHoveredSplitTooltipPosition,
  };
}
