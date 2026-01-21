import { GpxPoint } from '@/domain/types/GpxPoint';

export function chunkerizeSegments(
  points: GpxPoint[],
  segmentLength: number
): GpxPoint[][] {
  if (!points.length) {
    return [];
  }

  const segments: GpxPoint[][] = [];
  let currentSegment: GpxPoint[] = [];
  let segmentStartDistance = points[0].distance;

  for (const point of points) {
    currentSegment.push(point);

    if (point.distance - segmentStartDistance >= segmentLength) {
      segments.push(currentSegment);
      currentSegment = [point];
      segmentStartDistance = point.distance;
    }
  }

  if (currentSegment.length > 1) {
    segments.push(currentSegment);
  }

  return segments;
}
