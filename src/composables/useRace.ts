// src/composables/useRace.ts
import { GpxPoint } from '@/domain/entities/DistanceElevation';
import { roundOneNumber } from '@/lib/utils';
import type { Race, Split, Track } from '@runflow/shared';
import { computed, ref } from 'vue';
import { useGpxParser } from './useGpxParser';
import { useGpxSplits } from './useGpxSplits';

const race = ref<Race | null>(null);
const splits = ref<Split[]>([]);
const points = ref<GpxPoint[]>([]);
const totalDistance = ref<number>(null);
const { recomputeSplits } = useGpxSplits();

export function useRace() {
  const initRace = (r: Race, t: Track) => {
    race.value = r;
    const { gpxpoints, gpxtotalDistance } = useGpxParser(t.gpxContent);
    points.value = gpxpoints;
    totalDistance.value = roundOneNumber(gpxtotalDistance);
    splits.value = recomputeSplits({
      totalDistance: totalDistance.value,
      separators: race.value.splits
        .map((s) => s.startDistance)
        .filter((s) => s !== 0),
      oldSplits:
        race.value.splits?.length > 0 ? race.value.splits : initialSplits(),
    });
  };

  const initialSplits = () => {
    return recomputeSplits({
      totalDistance,
      separators: [],
      oldSplits: [],
    });
  };

  const separators = computed(() => {
    return splits.value.map((s) => s.startDistance).filter((s) => s !== 0);
  });

  const addSeparator = (d: number) => {
    const distance = roundOneNumber(d);
    splits.value = generateSplits(addDistanceToSeparators(distance));
  };

  const updateSeparator = (oldValue: number, newValue: number) => {
    splits.value = generateSplits(
      updateDistanceToSeparators(separators, oldValue, newValue)
    );
  };

  const deleteSeparator = (d: number) => {
    splits.value = generateSplits(deleteDistanceToSeparators(d));
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

  return {
    race,
    splits,
    points,
    separators,
    totalDistance,
    addSeparator,
    deleteSeparator,
    updateSeparator,
    updateSplitPace,
    initRace,
  };

  function generateSplits(newSeparators: number[]) {
    return recomputeSplits({
      separators: newSeparators,
      oldSplits: splits.value,
      totalDistance: totalDistance.value,
    });
  }

  function deleteDistanceToSeparators(d: number) {
    return [...separators.value].filter((el) => el !== d);
  }

  function addDistanceToSeparators(distance: number) {
    return [...separators.value, distance].sort((a, b) => a - b);
  }
}
function updateDistanceToSeparators(
  separators,
  oldValue: number,
  newValue: number
) {
  const newSeparators = [...separators.value].filter((el) => el !== oldValue);

  const withNewValue = [...newSeparators, newValue].sort((a, b) => a - b);
  return withNewValue;
}
