import { dateToMinutes, parseDate } from '@/domain/helpers/Time.helper';
import { Separator } from '@/types/entities/Separator';
import { SplitItem } from '@/types/SplitItem';
import { useRace } from '@/ui/composables/useRace';
import useRaceChartSplitHover from '@/ui/composables/useRaceChartSplitHover';
import { useRaceMetrics } from '@/ui/composables/useRaceMetrics';
import { computed, ref, watch } from 'vue';

const { splits, startTime, separators } = useRace();
const { hoveredSplit } = useRaceChartSplitHover();
const {
  getCumulElevationToDistance,
  getCumulDurationToDistance,
  getCumulNegativeElevationToDistance,
  getSplitDistance,
  getSplitNegativeElevation,
  getSplitFromDistance,
  getSplitSlopePercent,
  getSplitDuration,
  getSplitElevation,
} = useRaceMetrics();

const hoveredSplitItem = ref<SplitItem | null>();

const splitItems = computed((): SplitItem[] => {
  const firstItem = {
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

  const items = separators.value.map((separator: Separator, index: number) => {
    const split = getSplitFromDistance(separator.distance);

    const cumulDuration = getCumulDurationToDistance(separator.distance);

    const time = firstItem.time
      ? new Date(firstItem.time.getTime() + cumulDuration * 60 * 1000)
      : null;

    const timeBarrier = parseDate(separator.timeBarrier);

    const timeBarrierDuration = dateToMinutes(timeBarrier, firstItem.time);

    const timeBarrierValid = timeBarrier && time ? timeBarrier > time : null;

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

  return [firstItem, ...items];
});

export default function useRaceSplits() {
  watch(hoveredSplit, () => {
    const rowItem =
      splitItems.value.find(
        (r) => r.distance == hoveredSplit.value?.endDistance
      ) || null;
    hoveredSplitItem.value = rowItem;
  });

  const getItemSplit = (row: SplitItem) => {
    return (
      splits.value.find((split) => split.endDistance == row.distance) || null
    );
  };

  return {
    splitItems,
    hoveredSplitItem,
    getItemSplit,
  };
}
