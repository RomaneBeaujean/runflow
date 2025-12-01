import { Split } from '@/types/Split';

export function computeSplits(separators: number[]): Partial<Split>[] {
  return separators.map((end, index) => {
    const start = index === 0 ? 0 : separators[index - 1];

    return {
      startDistance: start,
      endDistance: end,
    };
  });
}

export function recomputeSplits({
  separators,
  oldSplits,
  totalDistance,
  averagePace,
}: {
  separators: number[];
  oldSplits?: Split[];
  totalDistance: number;
  averagePace: string;
}): Split[] {
  const previousSplits = oldSplits || [];
  const sep = [...new Set([...separators, totalDistance])];

  return sep.map((end, index) => {
    const start = index === 0 ? 0 : separators[index - 1];
    const oldSplit = previousSplits.find(
      (el) => el.startDistance == start || el.endDistance == end
    );
    const pace = oldSplit?.pace || averagePace;
    return {
      startDistance: start,
      endDistance: end,
      pace,
    };
  });
}
