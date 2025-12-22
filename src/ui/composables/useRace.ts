import { GpxParse, smoothPointsByDistance } from '@/domain/GpxParse';
import { roundOneNumber } from '@/domain/helpers/RoundNumbers.helper';
import { computeSlidingSlopeKm } from '@/domain/Slopes';
import { Race } from '@/types/entities/Race';
import { Separator } from '@/types/entities/Separator';
import { GpxPoint } from '@/types/GpxPoint';
import { SlidingSlopePoint } from '@/types/Slope';
import { Split } from '@/types/Split';
import { ref } from 'vue';
import { useRaceWatchers } from './useRaceWatchers';

const race = ref<Race | null>(null);
const startTime = ref<Date | null>(null);
const splits = ref<Split[]>([]);
const separators = ref<Separator[]>([]);
const points = ref<GpxPoint[]>([]);
const totalDistance = ref<number>(null);
const maxElevation = ref<number>(null);
const slidingSlopesPoints = ref<SlidingSlopePoint[]>([]);
const slopeMax = ref<number>();
const slopeMin = ref<number>();
const parsedFile = ref<GpxParse>();

export function useRace() {
  const initRace = (initialRace: Race) => {
    race.value = initialRace;

    parsedFile.value = new GpxParse(initialRace.gpxContent);

    // POINTS
    points.value = smoothPointsByDistance([...parsedFile.value.points], 0.3);
    slidingSlopesPoints.value = computeSlidingSlopeKm(points.value, 0.5);
    maxElevation.value = Math.max(
      ...parsedFile.value.points.map((el) => el.elevation)
    );
    slopeMax.value = Math.max(
      ...slidingSlopesPoints.value.map((it) => it.slope)
    );
    slopeMin.value = Math.min(
      ...slidingSlopesPoints.value.map((it) => it.slope)
    );

    // TOTAL DISTANCE
    totalDistance.value = parsedFile.value.totalDistance;

    // SEPARATORS
    const sep = [...(initialRace.separators || [])].sort(
      (a, b) => a.distance - b.distance
    );

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

    // Watchers
    useRaceWatchers();
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
    slopeMax,
    parsedFile,
    slopeMin,
    slidingSlopesPoints,
    addSeparator,
    deleteSeparator,
    updateSeparator,
    updateSplitPace,
    updateRaceStartTime,
    initRace,
  };
}
