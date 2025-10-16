import { Split } from '@/types/Split';

export function useGpxSplits() {
  function recomputeSplits({
    separators,
    oldSplits,
  }: {
    separators: number[];
    oldSplits?: Split[];
  }): Split[] {
    const splits: Split[] = [];
    const previousSplits = oldSplits || [];

    separators.forEach((currentDistance: number, index: number) => {
      const startDistance = index === 0 ? 0 : splits[index - 1].endDistance;
      const endDistance = currentDistance;
      const oldSplit = previousSplits.find(
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
