import { useGpxSplits } from '@/composables/useGpxSplits';
import { computeSlidingSlopeKm } from '@/lib/gpx/ClimbDetector';
import { GpxParse, smoothPointsByDistance } from '@/lib/gpx/GpxParse';
import { roundOneNumber } from '@/lib/utils';
import { Race } from '@/types/entities/Race';
import { Separator } from '@/types/entities/Separator';
import { GpxPoint } from '@/types/GpxPoint';
import { SlidingSlopePoint } from '@/types/Slope';
import { Split } from '@/types/Split';
import { ref, watch } from 'vue';

const race = ref<Race | null>(null);
const startTime = ref<Date | null>(null);
const splits = ref<Split[]>([]);
const separators = ref<Separator[]>([]);
const points = ref<GpxPoint[]>([]);
const totalDistance = ref<number>(null);
const maxElevation = ref<number>(null);
const slidingSlopesPoints = ref<SlidingSlopePoint[]>([]);
const { recomputeSplits } = useGpxSplits();

export function useRace() {
  const initRace = (initialRace: Race) => {
    race.value = initialRace;

    const parser = new GpxParse(initialRace.gpxContent);

    // POINTS
    points.value = smoothPointsByDistance(
      parser.points.slice().sort((a, b) => a.distance - b.distance), // slice pour cloner
      0.3
    );
    slidingSlopesPoints.value = computeSlidingSlopeKm(points.value, 0.5);
    maxElevation.value = Math.max(...parser.points.map((el) => el.elevation));

    // TOTAL DISTANCE
    totalDistance.value = parser.totalDistance;

    // SEPARATORS
    const sep = (initialRace.separators || [])
      .slice()
      .sort((a, b) => a.distance - b.distance);

    // ajouter totalDistance s'il n'existe pas
    if (!sep.some((el) => el.distance === totalDistance.value)) {
      sep.push(new Separator({ distance: totalDistance.value }));
    }

    separators.value = [...sep];

    // SPLITS
    splits.value = (initialRace.splits || [])
      .slice()
      .sort((a, b) => a.startDistance - b.endDistance);

    // START TIME
    startTime.value = initialRace.startTime || null;
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

  function deleteSeparatorByDistance(d: number) {
    return [...separators.value].filter((el: Separator) => el.distance !== d);
  }

  function addNewSeparator(newSeparator: Separator) {
    return [...separators.value, newSeparator].sort(
      (a: Separator, b: Separator) => a.distance - b.distance
    );
  }

  return {
    race,
    splits,
    points,
    startTime,
    separators,
    maxElevation,
    totalDistance,
    slidingSlopesPoints,
    addSeparator,
    deleteSeparator,
    updateSeparator,
    updateSplitPace,
    updateRaceStartTime,
    initRace,
  };
}

watch(
  [separators],
  () => {
    const distances = separators.value.map((el) => el.distance);
    splits.value = recomputeSplits({
      separators: distances,
      oldSplits: splits.value,
      totalDistance: totalDistance.value,
      averagePace: '06:30',
    });
  },
  { flush: 'post' }
);
