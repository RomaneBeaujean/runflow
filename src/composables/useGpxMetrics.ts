import {
  durationFromPaceAndDistance,
  minutesToFormattedDuration,
} from '@/lib/time';
import { roundOneNumber } from '@/lib/utils';
import { Separator } from '@/types/Separator';
import { Split } from '@/types/Split';
import { useRace } from './useRace';

const { points, separators, splits } = useRace();

export function useGpxMetrics() {
  function getCumulElevationToDistance(distance: number) {
    const point = points.value.find((el) => el.distance === distance);
    return point?.cumulElevation ?? 0;
  }

  function getCumulNegativeElevationToDistance(distance: number) {
    const point = points.value.find((el) => el.distance === distance);
    return point?.cumulNegativeElevation ?? 0;
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

  function getSplitElevation(split: Split) {
    const start = getPointFromDistance(split.startDistance);
    const end = getPointFromDistance(split.endDistance);
    return (end?.cumulElevation ?? 0) - (start?.cumulElevation ?? 0);
  }

  function getSplitNegativeElevation(split: Split) {
    const start = getPointFromDistance(split.startDistance);
    const end = getPointFromDistance(split.endDistance);
    return (
      (end?.cumulNegativeElevation ?? 0) - (start?.cumulNegativeElevation ?? 0)
    );
  }

  function getCumulDurationToDistance(distance: number): number {
    const relevantSplits = splits.value.filter(
      (s) => s.endDistance <= distance
    );
    const totalSplitDuration = relevantSplits.reduce(
      (acc: number, curr: Split) => {
        const splitDistance = roundOneNumber(
          curr.endDistance - curr.startDistance
        );
        const splitDuration = durationFromPaceAndDistance(
          curr.pace,
          splitDistance
        );
        return (acc += splitDuration);
      },
      0
    );

    const relevantRefuel = separators.value.filter(
      (s) => s.distance <= distance
    );

    const totalRefuelDuration = relevantRefuel.reduce(
      (acc: number, curr: Separator) => {
        const stopDuration = curr.stopDuration || 0;
        return (acc += stopDuration);
      },
      0
    );

    return totalSplitDuration + totalRefuelDuration;
  }

  function getFormattedDurationFromSplit(split: Split): string {
    return minutesToFormattedDuration(getSplitDuration(split));
  }

  function getSplitDistance(split: Split): number {
    const distance = roundOneNumber(split.endDistance - split.startDistance);
    return distance;
  }

  function getSplitDuration(split: Split): number {
    const distance = roundOneNumber(split.endDistance - split.startDistance);
    const durationMinutes = durationFromPaceAndDistance(split.pace, distance);
    return durationMinutes;
  }

  function getSplitSlopePercent(split: Split): {
    positive: string;
    negative: string;
    major: string;
  } {
    const elevation = getSplitElevation(split); // D+ en m
    const negativeElevation = getSplitNegativeElevation(split); // D- en m
    const distance = getSplitDistance(split); // en km

    if (distance === 0) {
      return null;
    }

    const positivePercent = roundOneNumber(
      (elevation / (distance * 1000)) * 100
    );
    const negativePercent = roundOneNumber(
      (negativeElevation / (distance * 1000)) * 100
    );

    const majorPercent: string =
      positivePercent >= negativePercent
        ? `+${positivePercent}`
        : `-${negativePercent}`;

    return {
      positive: `+${positivePercent}`,
      negative: `-${negativePercent}`,
      major: majorPercent,
    };
  }

  function getAveragePace(splits: Split[]): string {
    const totalDuration = splits.reduce((total, current) => {
      return (total += getSplitDuration(current));
    }, 0);
    const totalDistance = splits.reduce((total, current) => {
      return (total += getSplitDistance(current));
    }, 0);
    const pace = totalDuration / totalDistance;
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return {
    getPointFromDistance,
    getIndexFromDistance,
    getPointsFromSplit,
    getSplitDistance,
    getMidPointFromSplit,
    getSplitElevation,
    getSplitDuration,
    getSplitNegativeElevation,
    getCumulNegativeElevationToDistance,
    getFormattedDurationFromSplit,
    getCumulElevationToDistance,
    getCumulDurationToDistance,
    getSplitSlopePercent,
    getAveragePace,
  };
}
