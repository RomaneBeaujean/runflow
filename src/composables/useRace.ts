import { useGpxSplits } from '@/composables/useGpxSplits';
import { computeSlidingSlopeKm } from '@/lib/gpx/ClimbDetector';
import { GpxParse, smoothPointsByDistance } from '@/lib/gpx/GpxParse';
import { roundOneNumber } from '@/lib/utils';
import { Race } from '@/types/entities/Race';
import { Separator } from '@/types/entities/Separator';
import { GpxPoint } from '@/types/GpxPoint';
import { SlidingSlopePoint } from '@/types/Slope';
import { Split } from '@/types/Split';
import { computed, ref, watch } from 'vue';

const startTime = ref<Date | null>(null);
const race = ref<Race | null>(null);
const splits = ref<Split[]>([]);
const separators = ref<Separator[]>([]);
const points = ref<GpxPoint[]>([]);
const totalDistance = ref<number>(null);
const slidingSlopesPoints = ref<SlidingSlopePoint[]>([]);
const { recomputeSplits } = useGpxSplits();

export function useRace() {
  const initRace = (r: Race) => {
    race.value = r;

    const parser = new GpxParse(r.gpxContent);
    points.value = smoothPointsByDistance(
      parser.points.sort((a, b) => a.distance - b.distance),
      0.3
    );
    totalDistance.value = parser.totalDistance;
    separators.value =
      r.separators?.sort((a, b) => a.distance - b.distance) || [];
    splits.value =
      r.splits?.sort((a, b) => a.startDistance - b.endDistance) || [];
    startTime.value = r.startTime || null;
    slidingSlopesPoints.value = computeSlidingSlopeKm(points.value, 0.5);
  };

  const separatorsDistances = computed(() => {
    return separators.value.map((el) => el.distance);
  });

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
    slidingSlopesPoints,
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
