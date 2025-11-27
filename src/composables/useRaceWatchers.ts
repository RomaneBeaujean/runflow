import { watch } from 'vue';
import { useGpxSplits } from './useGpxSplits';
import { useRace } from './useRace';
import { useStores } from './useStores';

export function useRaceWatchers() {
  const { separators, splits, startTime, totalDistance, race } = useRace();
  const { recomputeSplits } = useGpxSplits();
  const stores = useStores();

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
    { deep: true, flush: 'post' }
  );

  watch(
    [splits, separators, startTime],
    async () => {
      stores.races.updateRace(race.value.id, {
        separators: separators.value,
        splits: splits.value,
        startTime: startTime.value,
      });
    },
    { deep: true, flush: 'post' }
  );
}
