import {
  durationFromPaceAndDistance,
  minutesToFormattedDuration,
} from '@/lib/time';
import type { Split } from '@runflow/shared';
import { useRace } from './useRace';

const { points } = useRace();

export function useGpxMetrics() {
  function getCumulElevationFromDistance(distance: number) {
    const point = points.value.find((el) => el.distance === distance);
    return point?.cumulElevation ?? 0;
  }

  function getPointFromDistance(distance: number) {
    return points.value.find((el) => el.distance >= distance);
  }

  function getIndexFromDistance(distance: number) {
    return points.value.findIndex((el) => el.distance >= distance);
  }

  function getPointsFromSplit(split: Split) {
    const startIndex = getIndexFromDistance(split.startDistance);
    const endIndex = getIndexFromDistance(split.endDistance);
    return points.value.slice(startIndex, endIndex + 1);
  }

  function getMidPointFromSplit(split: Split) {
    const startIndex = getIndexFromDistance(split.startDistance);
    const endIndex = getIndexFromDistance(split.endDistance);
    const midIndex = Math.floor((startIndex + endIndex) / 2);
    return points.value[midIndex];
  }

  function getElevationFromSplit(split: Split) {
    const start = getPointFromDistance(split.startDistance);
    const end = getPointFromDistance(split.endDistance);
    return (end?.cumulElevation ?? 0) - (start?.cumulElevation ?? 0);
  }

  function getCumulElevationFromSplit(splits: Split[], split: Split): number {
    const endDistance = split.endDistance;
    const relevantSplits = splits.filter((s) => s.endDistance <= endDistance);
    const totalElevation = relevantSplits.reduce((acc: number, curr: Split) => {
      return (acc += getElevationFromSplit(curr));
    }, 0);
    return totalElevation;
  }

  function getCumulDurationFromSplit(splits: Split[], split: Split): string {
    const endDistance = split.endDistance;
    const relevantSplits = splits.filter((s) => s.endDistance <= endDistance);
    const totalDuration = relevantSplits.reduce((acc: number, curr: Split) => {
      const splitDistance = Math.round(curr.endDistance - curr.startDistance);
      const splitDuration = durationFromPaceAndDistance(
        curr.pace,
        splitDistance
      );
      return (acc += splitDuration);
    }, 0);
    return minutesToFormattedDuration(totalDuration);
  }

  return {
    getCumulElevationFromDistance,
    getPointFromDistance,
    getIndexFromDistance,
    getPointsFromSplit,
    getMidPointFromSplit,
    getElevationFromSplit,
    getCumulDurationFromSplit,
    getCumulElevationFromSplit,
  };
}
