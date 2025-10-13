// src/composables/useRace.ts
import { roundOneNumber } from '@/lib/utils';
import { Race } from '@/types/entities/Race';
import { GpxPoint } from '@/types/GpxPoint';
import { Separator } from '@/types/Separator';
import { Split } from '@/types/Split';
import { Track } from '@/types/Track';
import { computed, ref, watch } from 'vue';
import { useGpxParser } from './useGpxParser';
import { useGpxSplits } from './useGpxSplits';

const startTime = ref<Date | null>(null);
const race = ref<Race | null>(null);
const splits = ref<Split[]>([]);
const separators = ref<Separator[]>([]);
const points = ref<GpxPoint[]>([]);
const totalDistance = ref<number>(null);
const { recomputeSplits } = useGpxSplits();

export function useRace() {
  const initRace = (r: Race, t: Track) => {
    race.value = r;

    const { gpxpoints, gpxtotalDistance } = useGpxParser(t.gpxContent);
    points.value = gpxpoints;
    totalDistance.value = roundOneNumber(gpxtotalDistance);

    separators.value = r.separators || [];
    startTime.value = r.startTime || null;

    addEndSeparator();

    splits.value = recomputeSplits({
      separators: separatorsDistances.value,
      oldSplits: r.splits?.length > 0 ? r.splits : initialSplits(),
    });
  };

  const separatorsDistances = computed(() => {
    return separators.value.map((el) => el.distance);
  });

  const initialSplits = () => {
    return recomputeSplits({
      separators: [],
      oldSplits: [],
    });
  };

  const addEndSeparator = () => {
    if (
      separators.value.findIndex((el) => el.distance === totalDistance.value) <
      0
    ) {
      const separator: Separator = {
        distance: totalDistance.value,
        refuel: false,
        stopDuration: 0,
        timeBarrier: null,
      };
      separators.value = addNewSeparator(separator);
    }
  };

  const updateRaceStartTime = (newStartTime: Date) => {
    startTime.value = newStartTime;
  };

  const addSeparator = (separator: Separator) => {
    const distance = roundOneNumber(separator.distance);
    separators.value = addNewSeparator({ ...separator, distance });
  };

  const updateSeparator = (oldValue: Separator, newValue: Separator) => {
    const withoutOldValue = [...separators.value].filter(
      (el) => el.distance !== oldValue.distance
    );

    const withNewValue = [...withoutOldValue, newValue].sort(
      (a: Separator, b: Separator) => a.distance - b.distance
    );

    separators.value = withNewValue;
  };

  const deleteSeparator = (d: number) => {
    separators.value = deleteSeparatorByDistance(d);
  };

  const updateSplitPace = (split: Split, newPace: string) => {
    splits.value = [...splits.value].map((el) => {
      if (el.startDistance === split.startDistance) {
        return {
          ...el,
          pace: newPace,
        };
      }
      return el;
    });
  };

  watch(
    () => separators,
    () => {
      splits.value = generateSplits();
    },
    { deep: true }
  );

  return {
    race,
    splits,
    points,
    startTime,
    separators,
    totalDistance,
    addSeparator,
    deleteSeparator,
    updateSeparator,
    updateSplitPace,
    updateRaceStartTime,
    initRace,
  };

  function generateSplits() {
    return recomputeSplits({
      separators: separatorsDistances.value,
      oldSplits: splits.value,
    });
  }

  function deleteSeparatorByDistance(d: number) {
    return [...separators.value].filter((el: Separator) => el.distance !== d);
  }

  function addNewSeparator(newSeparator: Separator) {
    return [...separators.value, newSeparator].sort(
      (a: Separator, b: Separator) => a.distance - b.distance
    );
  }
}
