import { useRace } from '@/composables/useRace';
import { getAveragePace } from '@/lib/gpx/Metrics';
import {
  dateToFormattedTime,
  durationFromPaceAndDistance,
  minutesToFormattedDuration,
  parseDate,
} from '@/lib/time';
import { roundOneNumber } from '@/lib/utils';
import { Separator } from '@/types/entities/Separator';
import { GpxPoint } from '@/types/GpxPoint';
import { Split } from '@/types/Split';
import { computed } from 'vue';

const { points, separators, splits, totalDistance, race } = useRace();

export function useRaceMetrics() {
  function getCumulElevationToDistance(distance: number) {
    const point = points.value.find((el) => el.distance === distance);
    return Math.round(point?.cumulElevation ?? 0);
  }

  function getCumulNegativeElevationToDistance(distance: number) {
    const point = points.value.find((el) => el.distance === distance);
    return Math.round(point?.cumulNegativeElevation ?? 0);
  }

  function getClosestPoint(targetDistance: number): GpxPoint {
    let left = 0,
      right = points.value.length - 1;
    let closest = points.value[0];
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midPoint = points.value[mid];
      if (
        Math.abs(midPoint.distance - targetDistance) <
        Math.abs(closest.distance - targetDistance)
      ) {
        closest = midPoint;
      }
      if (midPoint.distance < targetDistance) left = mid + 1;
      else right = mid - 1;
    }
    return closest;
  }

  function getClosestSeparator(targetDistance: number): Separator | null {
    if (separators.value.length === 0) return null;
    let left = 0,
      right = separators.value.length - 1;
    let closest = separators.value[0];
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midSep = separators.value[mid];
      if (
        Math.abs(midSep.distance - targetDistance) <
        Math.abs(closest.distance - targetDistance)
      ) {
        closest = midSep;
      }
      if (midSep.distance < targetDistance) left = mid + 1;
      else right = mid - 1;
    }
    return closest;
  }

  function getSplitFromDistance(distance: number): Split | null {
    let left = 0;
    let right = splits.value.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const split = splits.value[mid];
      if (distance < split.startDistance) right = mid - 1;
      else if (distance > split.endDistance) left = mid + 1;
      else return split;
    }
    return null;
  }

  function getFormattedTimeToDistance(distance: number) {
    const time = race.value.startTime
      ? new Date(
          parseDate(race.value.startTime).getTime() +
            getCumulDurationToDistance(distance) * 60 * 1000
        )
      : null;
    return dateToFormattedTime(time);
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
    return Math.round(
      (end?.cumulElevation ?? 0) - (start?.cumulElevation ?? 0)
    );
  }

  function getSplitNegativeElevation(split: Split) {
    const start = getPointFromDistance(split.startDistance);
    const end = getPointFromDistance(split.endDistance);
    return Math.round(
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
    return roundOneNumber(distance);
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

  const averagePace = computed(() => {
    return getAveragePace(splits.value, separators.value, totalDistance.value);
  });

  return {
    getPointFromDistance,
    getIndexFromDistance,
    getPointsFromSplit,
    getSplitDistance,
    getMidPointFromSplit,
    getSplitFromDistance,
    getSplitElevation,
    getSplitDuration,
    getSplitNegativeElevation,
    getCumulNegativeElevationToDistance,
    getFormattedDurationFromSplit,
    getClosestSeparator,
    getCumulElevationToDistance,
    getCumulDurationToDistance,
    getSplitSlopePercent,
    getClosestPoint,
    getFormattedTimeToDistance,
    averagePace,
  };
}
