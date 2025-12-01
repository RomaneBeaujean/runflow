import { getDistance } from '@/lib/gpx/Metrics';
import { roundOneNumber } from '@/lib/utils';
import { GpxPoint } from '@/types/GpxPoint';
import { GpxSegment } from '@/types/GpxSegment';
import { SlidingSlopePoint, SlopeSize, SlopeType } from '@/types/Slope';

export function computeSegmentSlope(segments: GpxPoint[][]): GpxSegment[] {
  return segments.map((seg) => {
    const lastPoint = seg[seg.length - 1];
    const firstPoint = seg[0];
    const elevation = lastPoint.elevation - firstPoint.elevation;
    const distance = lastPoint.distance - firstPoint.distance;
    const slope = distance > 0 ? (elevation / distance) * 100 : 0;

    return {
      startDistance: firstPoint.distance,
      endDistance: lastPoint.distance,
      distance: getDistance(seg),
      slope,
      slopeType: getSlopeType(slope),
      points: seg,
    };
  });
}

export function computeSegmentSlopeKm(segments: GpxPoint[][]): GpxSegment[] {
  return segments.map((seg) => {
    const points = seg.sort((a, b) => a.distance - b.distance);
    const lastPoint = points[seg.length - 1];
    const firstPoint = points[0];
    const diffElevation = lastPoint.elevation - firstPoint.elevation;
    const distance = roundOneNumber(lastPoint.distance - firstPoint.distance);
    const distanceMeters = roundOneNumber(distance * 1000);

    const slope = Math.round(
      distanceMeters > 0 ? (diffElevation / distanceMeters) * 100 : 0
    );

    return {
      startDistance: firstPoint.distance,
      endDistance: lastPoint.distance,
      distance: getDistance(seg),
      slope,
      slopeType: getSlopeType(slope),
      points: seg,
    };
  });
}

export const getSlopeColors = (slope: string | number) => {
  const absVal = Math.abs(Number(slope));
  let background = '';
  let color = '';
  if (absVal <= 5) {
    background = '#bbf7d0'; // vert pastel
    color = '#065f46';
  } else if (absVal <= 10) {
    background = '#fef08a'; // jaune pastel
    color = '#78350f';
  } else if (absVal <= 15) {
    background = '#fed7aa'; // orange pastel
    color = '#78350f';
  } else if (absVal <= 20) {
    background = '#fecaca'; // rouge pastel
    color = '#7f1d1d';
  } else {
    background = '#e0d7fd'; // violet pastel
    color = '#4c1d95';
  }

  return { background, color };
};

export const getAreaSlopeColors = (slope: number) => {
  const absVal = Math.abs(Number(slope));
  if (absVal <= 5) {
    return '#009966'; // vert
  } else if (absVal <= 10) {
    return '#FEE685'; // jaune
  } else if (absVal <= 15) {
    return '#FF6900'; // orange
  } else if (absVal <= 20) {
    return '#FB2C36'; // rouge
  } else return '#C6005C'; // violet
};

export function computeSlidingSlope(
  points: GpxPoint[],
  windowSize: number
): SlidingSlopePoint[] {
  if (points.length < 2) return [];
  const totalDistance = points[points.length - 1].distance;

  let slidingSlopePoints = [];

  for (let i = 0; i < points.length; i++) {
    const current = points[i];

    const currDistance = points[i].distance;
    const startDistance = Math.max(0, currDistance - windowSize / 2);
    const endDistance = Math.min(currDistance + windowSize / 2, totalDistance);
    const startPoint = points.find((el) => el.distance >= startDistance);
    const endPoint = points.find((el) => el.distance >= endDistance);

    const deltaElevation = endPoint.elevation - startPoint.elevation;
    const deltaDistance = endPoint.distance - startPoint.distance;
    const slope =
      deltaDistance > 0 ? (deltaElevation / deltaDistance) * 100 : 0;

    slidingSlopePoints.push({
      distance: current.distance,
      point: current,
      slope,
      slopeType: getSlopeType(slope),
      slopeSize: getSlopeSize(slope),
    });
  }

  return slidingSlopePoints;
}

export function computeSlidingSlopeKm(
  points: GpxPoint[],
  windowSize: number
): SlidingSlopePoint[] {
  if (points.length < 2) return [];
  const totalDistance = points[points.length - 1].distance;

  let slidingSlopePoints = [];

  points.forEach((current, i) => {
    const currDistance = points[i].distance;
    const startDistance = Math.max(0, currDistance - windowSize / 2);
    const endDistance = Math.min(totalDistance, currDistance + windowSize / 2);
    const startPoint = points.find((el) => el.distance >= startDistance);
    const endPoint = points.find((el) => el.distance >= endDistance);

    const deltaElevation = endPoint.elevation - startPoint.elevation;
    const deltaDistance = roundOneNumber(
      (endPoint.distance - startPoint.distance) * 1000
    );
    const slope =
      deltaDistance > 0
        ? roundOneNumber((deltaElevation / deltaDistance) * 100)
        : 0;

    slidingSlopePoints.push({
      distance: current.distance,
      point: current,
      slope,
      slopeType: getSlopeType(slope),
      slopeSize: getSlopeSize(slope),
    });
  });

  return slidingSlopePoints;
}

export const getSlopeType = (slope: number): SlopeType => {
  if (slope > 1) return 'up';
  if (slope < -1) return 'down';
  return 'flat';
};

export const getSlopeSize = (slope: number): SlopeSize => {
  const abs = Math.abs(slope);
  if (abs < 5) return 'small';
  if (abs < 10) return 'medium';
  if (abs < 15) return 'large';
  return 'xlarge';
};
