import { useRace } from '@/composables/useRace';
import { dateToMinutes, parseDate } from '@/lib/time';
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
    cumulDuration: 0,
    cumulElevation: 0,
    cumulNegativeElevation: 0,
    splitDistance: 0,
    splitDuration: 0,
    splitElevation: 0,
    splitNegativeElevation: 0,
    splitPace: null,
    split: null,
    timeBarrier: null,
    timeBarrierDuration: null,
    timeBarrierValid: null,
    stopDuration: null,
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

    const timeBarrier = parseDate(separator.timeBarrier);

    const timeBarrierDuration = dateToMinutes(timeBarrier, firstRow.time);

    const timeBarrierValid = timeBarrier ? timeBarrier > time : null;

    return {
      id: `row-${separator.distance}`,
      index: index + 1,
      refuel: separator.refuel,
      distance: separator.distance,
      stopDuration: separator.stopDuration || 0,
      cumulDuration,
      cumulElevation: getCumulElevationToDistance(separator.distance),
      cumulNegativeElevation: getCumulNegativeElevationToDistance(
        separator.distance
      ),
      split,
      splitDistance: getSplitDistance(split),
      splitDuration: getSplitDuration(split),
      splitElevation: getSplitElevation(split),
      splitNegativeElevation: getSplitNegativeElevation(split),
      splitSlopePercent: getSplitSlopePercent(split).major,
      splitPace: split.pace,
      time,
      timeBarrier,
      timeBarrierDuration,
      timeBarrierValid,
    };
  });

  return [firstRow, ...rows];
});

export default function useRaceTableRows() {
  watch(hoveredSplit, () => {
    const rowItem =
      rows.value.find((r) => r.distance == hoveredSplit.value?.endDistance) ||
      null;
    hoveredRow.value = rowItem;
  });

  const getRowSplit = (row: TableRowItem) => {
    return (
      splits.value.find((split) => split.endDistance == row.distance) || null
    );
  };

  return {
    rows,
    hoveredRow,
    getRowSplit,
  };
}
