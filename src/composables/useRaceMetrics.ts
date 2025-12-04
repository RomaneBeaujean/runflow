import { useRace } from '@/composables/useRace';
import { getAveragePace } from '@/lib/gpx/Metrics';
import {
  dateToFormattedTime,
  durationFromPaceAndDistance,
  minutesToFormattedDuration,
  numberToPace,
  paceToNumber,
  parseDate,
} from '@/lib/time';
import { roundOneNumber } from '@/lib/utils';
import { Separator } from '@/types/entities/Separator';
import { GpxPoint } from '@/types/GpxPoint';
import { Split } from '@/types/Split';
import { computed } from 'vue';

const { points, separators, splits, totalDistance, race, slidingSlopesPoints } =
  useRace();

export function useRaceMetrics() {
  function getCumulElevationToDistance(distance: number) {
    const point = points.value.find((el) => el.distance === distance);
    return Math.round(point?.cumulElevation ?? 0);
  }

  function getCumulNegativeElevationToDistance(distance: number) {
    const point = points.value.find((el) => el.distance === distance);
    return Math.round(point?.cumulNegativeElevation ?? 0);
  }

  function getSlopeFromDistance(targetDistance: number): number {
    const closestPoint = slidingSlopesPoints.value.find(
      (el) => el.distance >= targetDistance
    );
    return closestPoint?.slope || 0;
  }

  function getPaceFromDistance(targetDistance: number): string {
    const closestSplit = getSplitFromDistance(targetDistance);
    return closestSplit.pace;
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
    if (!targetDistance || separators.value.length === 0) return null;

    let left = 0;
    let right = separators.value.length - 1;

    let closest = separators.value[0];

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midSeparator = separators.value[mid];

      // Mise à jour du plus proche
      if (
        Math.abs(midSeparator.distance - targetDistance) <
        Math.abs(closest.distance - targetDistance)
      ) {
        closest = midSeparator;
      }

      if (midSeparator.distance < targetDistance) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return closest;
  }

  function getSeparatorFromDistance(targetDistance: number): Separator | null {
    if (!targetDistance) return null;
    return (
      separators.value.find(
        (el) => roundOneNumber(el.distance) == roundOneNumber(targetDistance)
      ) || null
    );
  }

  function getSplitFromDistance(distance: number): Split | null {
    return (
      splits.value.find(
        (el) => distance >= el.startDistance && distance <= el.endDistance
      ) || null
    );
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
        const distance = curr.endDistance - curr.startDistance;
        const pace = paceToNumber(curr.pace);
        const duration = pace * distance;
        return (acc += duration);
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

    const currentSplit = splits.value.find(
      (el) => el.startDistance < distance && el.endDistance > distance
    );

    const currentSplitDistance = currentSplit
      ? distance - currentSplit.startDistance
      : 0;
    const currentSplitDuration = currentSplit
      ? currentSplitDistance * paceToNumber(currentSplit.pace)
      : 0;

    return totalSplitDuration + totalRefuelDuration + currentSplitDuration;
  }

  function getFormattedDurationFromSplit(split: Split): string {
    return minutesToFormattedDuration(getSplitDuration(split));
  }

  function getSplitDistance(split: Split): number {
    if (!split) throw new Error('Cannot read properties of null');
    const distance = roundOneNumber(split.endDistance - split.startDistance);
    return roundOneNumber(distance);
  }

  function getSplitDuration(split: Split): number {
    if (!split) throw new Error('Cannot read properties of null');
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
    return getAveragePace(splits.value, separators.value);
  });

  const maxPace = computed(() => {
    const maxPaceNumber = Math.max(
      ...splits.value.map((el) => paceToNumber(el.pace))
    );
    return numberToPace(maxPaceNumber);
  });

  const minPace = computed(() => {
    const maxPaceNumber = Math.min(
      ...splits.value.map((el) => paceToNumber(el.pace))
    );
    return numberToPace(maxPaceNumber);
  });

  const maxElevation = computed(() => {
    return Math.max(...points.value.map((el) => el.elevation));
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
    getPaceFromDistance,
    getSplitNegativeElevation,
    getCumulNegativeElevationToDistance,
    getSlopeFromDistance,
    getFormattedDurationFromSplit,
    getClosestSeparator,
    getSeparatorFromDistance,
    getCumulElevationToDistance,
    getCumulDurationToDistance,
    getSplitSlopePercent,
    getClosestPoint,
    getFormattedTimeToDistance,
    averagePace,
    maxPace,
    minPace,
    maxElevation,
  };
}
