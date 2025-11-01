import { GpxParse, smoothPointsByDistance } from '@/lib/gpx/GpxParse';
import { GpxPoint } from '@/types/GpxPoint';
import { SlopeType } from '@/types/Slope';
import { roundOneNumber } from '../utils';

type TransitionType = 'summit' | 'valley';

type SlopeSize = 'small' | 'medium' | 'large' | 'xlarge';

interface SlidingSlopePoint {
  distance: number;
  point: GpxPoint;
  slope: number;
  slopeSize: SlopeSize;
  slopeType: SlopeType;
}

export class ClimbDetector {
  public separators: number[];

  constructor(xml: string) {
    const parsed = new GpxParse(xml);
    const smoothedPoints = smoothPointsByDistance(parsed.points, 1);
    const points = computeSlidingSlope(smoothedPoints, 0.3);
    this.separators = detectTransitions(points, 0.3);
  }
}

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

  for (let i = 0; i < points.length; i++) {
    const current = points[i];

    const currDistance = points[i].distance;
    const startDistance = Math.max(0, currDistance - windowSize / 2);
    const endDistance = Math.min(currDistance + windowSize / 2, totalDistance);
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
  }

  return slidingSlopePoints;
}

const getSlopeType = (slope: number): SlopeType => {
  if (slope > 3) return 'up';
  if (slope < -3) return 'down';
  return 'flat';
};

const getSlopeSize = (slope: number): SlopeSize => {
  const abs = Math.abs(slope);
  if (abs < 5) return 'small';
  if (abs < 10) return 'medium';
  if (abs < 15) return 'large';
  return 'xlarge';
};

const detectTransitions = (
  points: SlidingSlopePoint[],
  windowSize: number
): number[] => {
  let transitions = [];
  let currentType: SlopeType = points[0].slopeType;

  for (let i = 0; i < points.length; i++) {
    if (points[i].slopeType === currentType || points[i].distance < 1) continue;

    const startIndex = points.findIndex(
      (p) => p.distance >= points[i].distance - windowSize / 2
    );
    const endIndex = points.findIndex(
      (p) => p.distance >= points[i].distance + windowSize / 2
    );
    const transitionPoints = points.slice(startIndex, endIndex);
    const transitionType = getTransitionType(currentType, points[i].slopeType);

    const exactDistance = detectExactTransitionDistance(
      transitionPoints,
      transitionType
    );

    const nextPoints = points.filter((p) => p.distance >= exactDistance);

    const nextType = points[i].slopeType;
    const otherTypePoint = nextPoints.find((el) => el.slopeType !== nextType);
    const nextSegmentDistance = !otherTypePoint
      ? null
      : otherTypePoint?.distance - exactDistance;

    if (nextSegmentDistance !== null && nextSegmentDistance < 0.5) continue;

    transitions.push(exactDistance);
    currentType = points[i].slopeType;
  }

  return transitions;
};

function detectExactTransitionDistance(
  points: SlidingSlopePoint[],
  transitionType: 'summit' | 'valley'
): number {
  if (points.length === 0) return 0;
  if (transitionType === 'summit') {
    // retourne le point avec la plus grande altitude
    return points.reduce(
      (maxPoint, p) =>
        p.point.elevation >= maxPoint.point.elevation ? p : maxPoint,
      points[0]
    ).distance;
  } else {
    // retourne le point avec la plus petite altitude
    return points.reduce(
      (minPoint, p) =>
        p.point.elevation <= minPoint.point.elevation ? p : minPoint,
      points[0]
    ).distance;
  }
}

const getTransitionType = (
  oldType: SlopeType,
  newType: SlopeType
): TransitionType => {
  if (oldType === 'up') return 'summit';
  if (oldType === 'down') return 'valley';
  if (newType === 'up') return 'valley';
  return 'summit';
};
