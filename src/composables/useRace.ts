// src/composables/useRace.ts
import { roundOneNumber } from '@/lib/utils';
import { GpxPoint } from '@/types/DistanceElevation';
import { Race } from '@/types/entities/Race';
import { Separator } from '@/types/Separator';
import { Split } from '@/types/Split';
import { Track } from '@/types/Track';
import { computed, ref, watch } from 'vue';
import { useGpxParser } from './useGpxParser';
import { useGpxSplits } from './useGpxSplits';

const race = ref<Race | null>(null);
const splits = ref<Split[]>([]);
const separators = ref<Separator[]>([]);
const points = ref<GpxPoint[]>([]);
const totalDistance = ref<number>(null);
const initialized = ref(false);
const { recomputeSplits } = useGpxSplits();

export function useRace() {
  const initRace = (r: Race, t: Track) => {
    race.value = r;
    const { gpxpoints, gpxtotalDistance } = useGpxParser(t.gpxContent);
    points.value = gpxpoints;
    totalDistance.value = roundOneNumber(gpxtotalDistance);
    separators.value = r.separators || [];
    splits.value = recomputeSplits({
      totalDistance: totalDistance.value,
      separators: (r.separators || [])
        .map((s) => s.distance)
        .filter((s) => s !== 0),
      oldSplits:
        race.value.splits?.length > 0 ? race.value.splits : initialSplits(),
    });

    initialized.value = true;
  };

  const separatorsDistances = computed(() => {
    return separators.value.map((el) => el.distance);
  });

  const initialSplits = () => {
    return recomputeSplits({
      totalDistance,
      separators: [],
      oldSplits: [],
    });
  };

  const addSeparator = (separator: Separator) => {
    const distance = roundOneNumber(separator.distance);
    separators.value = addDistanceToSeparators({
      type: separator.type,
      distance,
    });
  };

  const updateSeparator = (oldValue: number, newValue: Separator) => {
    const oldSeparator = separators.value.find(
      (el) => el.distance === oldValue
    );
    separators.value = updateDistanceToSeparators(oldSeparator, newValue);
  };

  const deleteSeparator = (d: number) => {
    separators.value = deleteDistanceToSeparators(d);
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
      if (!initialized.value) return;
      splits.value = generateSplits();
    },
    { deep: true }
  );

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

  function generateSplits() {
    return recomputeSplits({
      separators: separatorsDistances.value,
      oldSplits: splits.value,
      totalDistance: totalDistance.value,
    });
  }

  function deleteDistanceToSeparators(d: number) {
    return [...separators.value].filter((el: Separator) => el.distance !== d);
  }

  function addDistanceToSeparators(newSeparator: Separator) {
    return [...separators.value, newSeparator].sort(
      (a: Separator, b: Separator) => a.distance - b.distance
    );
  }

  function updateDistanceToSeparators(
    oldValue: Separator,
    newValue: Separator
  ): Separator[] {
    const newSeparators = [...separators.value].filter(
      (el) => el.distance !== oldValue.distance
    );

    const withNewValue = [...newSeparators, newValue].sort(
      (a: Separator, b: Separator) => a.distance - b.distance
    );

    return withNewValue;
  }
}
