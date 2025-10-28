import { durationFromPaceAndDistance } from '@/lib/time';
import { Separator } from '@/types/entities/Separator';
import { Split } from '@/types/Split';

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

export function getAveragePace(
  splits: Split[],
  separators: Separator[],
  totalDistance: number
) {
  const totalDuration = getTotalDuration(splits, separators);
  const pace = totalDuration / totalDistance;
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
