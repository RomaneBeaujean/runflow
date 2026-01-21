import { durationFromPaceAndDistance } from '@/domain/helpers/Time.helper';
import { GpxPoint } from '@/domain/types/GpxPoint';
import { GpxSegment } from '@/domain/types/GpxSegment';
import { Separator } from '@/domain/types/Separator';
import { Split } from '@/domain/types/Split';

export function getTotalDuration(
  splits: Split[],
  separators: Separator[]
): number {
  const splitsDuration = splits.reduce((acc: number, curr: Split) => {
    const splitDistance = curr.endDistance - curr.startDistance;
    const splitDuration =
      durationFromPaceAndDistance(curr.pace, splitDistance) || 0;
    return (acc += splitDuration);
  }, 0);
  const refuelDuration = separators.reduce((acc: number, curr: Separator) => {
    const stopDuration = curr.stopDuration || 0;
    return (acc += stopDuration);
  }, 0);

  return splitsDuration + refuelDuration;
}

export function getTotalDistance(splits: Split[]): number {
  return splits.reduce(
    (acc, curr) => (acc += curr.endDistance - curr.startDistance),
    0
  );
}

export function getAveragePace(splits: Split[], separators: Separator[]) {
  const totalDuration = getTotalDuration(splits, separators);
  const totalDistance = getTotalDistance(splits);
  const pace = totalDuration / totalDistance;
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const getElevation = (points: GpxPoint[]) => {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const elevation = lastPoint.cumulElevation - firstPoint.cumulElevation;
  return elevation;
};

export const getDistance = (points: GpxPoint[]) => {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const distance = lastPoint.distance - firstPoint.distance;
  return distance;
};

export const getSlope = (points: GpxPoint[]) => {
  const elevation = getElevation(points);
  const distance = getDistance(points);
  return (elevation / distance) * 100;
};

export const getSlopeDiff = (slopeA: number, slopeB: number) => {
  const averageDiff = Math.max(slopeA, slopeB) - Math.min(slopeA, slopeB);
  return averageDiff;
};

export const getPoints = (segments: GpxSegment[]) => {
  return segments.reduce((s, c) => {
    return [...s, ...c.points];
  }, []);
};
