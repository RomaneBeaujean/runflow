import type { Split } from '@runflow/shared';

export function useGpxSplits() {
  function recomputeSplits({ totalDistance, separators, oldSplits }) {
    const allSeparators = [...separators, totalDistance];
    const splits: Split[] = [];

    allSeparators.forEach((currentDistance, index) => {
      const startDistance = index === 0 ? 0 : splits[index - 1].endDistance;
      const endDistance = currentDistance;
      const oldSplit = oldSplits.find(
        (os: Split) => os.startDistance >= startDistance
      );
      const pace = oldSplit ? oldSplit.pace : '06:30';
      splits.push({ startDistance, endDistance, pace });
    });

    return splits;
  }

  return {
    recomputeSplits,
  };
}
