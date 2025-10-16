import { useRace } from '@/composables/useRace';
import { parseDate } from '@/lib/time';
import { Separator } from '@/types/entities/Separator';
import { TableRowItem } from '@/types/TableRowItem';
import { computed, ref, watch } from 'vue';
import { useGpxMetrics } from './useGpxMetrics';
import useRaceChartSplitHover from './useRaceChartSplitHover';

const { splits, startTime, separators } = useRace();
const { hoveredSplit } = useRaceChartSplitHover();
const {
  getCumulElevationToDistance,
  getCumulDurationToDistance,
  getCumulNegativeElevationToDistance,
  getSplitDistance,
  getSplitNegativeElevation,
  getSplitSlopePercent,
  getSplitDuration,
  getSplitElevation,
} = useGpxMetrics();

const hoveredRow = ref<TableRowItem | null>();

const rows = computed((): TableRowItem[] => {
  const firstRow = {
    id: `row-0`,
    index: 0,
    refuel: false,
    distance: 0,
    timeBarrier: null,
    cumulDuration: 0,
    cumulElevation: 0,
    cumulNegativeElevation: 0,
    splitDistance: 0,
    splitDuration: 0,
    splitElevation: 0,
    splitNegativeElevation: 0,
    splitPace: null,
    timeBarrierTime: null,
    splitSlopePercent: null,
    time: parseDate(startTime.value),
  };

  const rows = separators.value.map((separator: Separator, index: number) => {
    const split = splits.value.find(
      (s) => s.endDistance === separator.distance
    );

    const cumulDuration = getCumulDurationToDistance(separator.distance);

    const time = firstRow.time
      ? new Date(firstRow.time.getTime() + cumulDuration * 60 * 1000)
      : null;

    const timeBarrierTime =
      firstRow.time && separator.timeBarrier
        ? new Date(firstRow.time.getTime() + separator.timeBarrier * 60 * 1000)
        : null;

    return {
      id: `row-${separator.distance}`,
      index: index + 1,
      refuel: separator.refuel,
      distance: separator.distance,
      timeBarrier: separator.timeBarrier || null,
      stopDuration: separator.stopDuration || 0,
      cumulDuration,
      cumulElevation: getCumulElevationToDistance(separator.distance),
      cumulNegativeElevation: getCumulNegativeElevationToDistance(
        separator.distance
      ),
      splitDistance: getSplitDistance(split),
      splitDuration: getSplitDuration(split),
      splitElevation: getSplitElevation(split),
      splitNegativeElevation: getSplitNegativeElevation(split),
      splitSlopePercent: getSplitSlopePercent(split).major,
      splitPace: split.pace,
      time,
      timeBarrierTime,
    };
  });

  return [firstRow, ...rows];
});

export default function useRaceTableRows() {
  const onTableMouseEnter = (e: MouseEvent) => {
    if (
      !(e.target instanceof HTMLElement) ||
      !e.target.classList.contains('race-table-row')
    )
      return;
    const distanceString = Array.from(e.target.classList)
      .find((c) => c.includes('distance-'))
      ?.replace('distance-', '');
    if (!distanceString) return;
    const distance = Number(distanceString);
    if (distance === 0) return;
    const split = splits.value.find((el) => el.endDistance === distance);
    if (!split) return;
    hoveredSplit.value = split;
  };

  const onTableMouseLeave = (e: MouseEvent) => {
    if (
      !(e.target instanceof HTMLElement) ||
      e.target.tagName.toLowerCase() !== 'table'
    )
      return;
    hoveredRow.value = null;
  };

  watch(hoveredSplit, () => {
    if (!hoveredSplit.value) {
      hoveredRow.value = null;
    } else {
      const rowItem = rows.value.find(
        (r) => r.distance == hoveredSplit.value.endDistance
      );
      hoveredRow.value = rowItem || null;
    }
  });

  return {
    rows,
    hoveredRow,
    onTableMouseLeave,
    onTableMouseEnter,
  };
}
