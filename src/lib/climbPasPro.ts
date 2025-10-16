import { GpxPoint } from '@/types/GpxPoint';
import { roundOneNumber } from './utils';

export type SlopeType = 'up' | 'down' | 'flat';

export interface GpxSegment {
  startDistance: number; // km
  endDistance: number; // km
  points: GpxPoint[];
  startElevation: number;
  endElevation: number;
  elevationDiff: number;
  slopePercent: number;
  slopeType: SlopeType;
}

export interface SegmentTransition {
  type: 'summit' | 'valley';
  distance: number;
}

export interface SlopeTransition {
  transitionType: 'summit' | 'valley';
  startPoint: { distance: number; slope: number; slopeType: SlopeType };
  endPoint: { distance: number; slope: number; slopeType: SlopeType };
  distance: number;
}

export const computeSeparators = (
  points: GpxPoint[],
  smoothWindowSize = 10,
  segmentLengthKm = 0.05,
  minimumSegmentLengthKm = 0.5
): number[] => {
  const totalDistance = points[points.length - 1].distance;
  const smoothed = smoothPoints(points, smoothWindowSize);
  const averageRollingDistanceMeters = segmentLengthKm / 1000;
  const rollingSlopes = computeRollingSlope(
    smoothed,
    averageRollingDistanceMeters
  );
  const transitions = detectRollingSlopeTransitions(
    rollingSlopes,
    minimumSegmentLengthKm
  );
  return transitions
    .map((el) => roundOneNumber(el.distance))
    .filter(
      (el) =>
        el > minimumSegmentLengthKm &&
        el < totalDistance - minimumSegmentLengthKm
    );
};

function smoothPoints(data: GpxPoint[], windowSize = 5) {
  const smoothed = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.floor(windowSize / 2));
    const subset = data.slice(start, end);
    const avgElevation =
      subset.reduce((sum, p) => sum + p.elevation, 0) / subset.length;
    smoothed.push({ ...data[i], elevation: avgElevation });
  }
  return smoothed;
}

function computeRollingSlope(
  points: GpxPoint[],
  windowSizeMeters: number
): {
  distance: number;
  point: GpxPoint;
  slope: number;
  slopeType: SlopeType;
}[] {
  const allPoints = [...points];

  if (allPoints.length < 2) return [];

  const result: {
    distance: number;
    point: GpxPoint;
    slope: number;
    slopeType: SlopeType;
  }[] = [];

  for (let i = 0; i < allPoints.length; i++) {
    const current = allPoints[i];

    // Trouver le point de départ de la fenêtre N mètres avant
    const targetDistance = current.distance - windowSizeMeters / 1000; // km
    let startIndex = i;

    while (startIndex > 0 && allPoints[startIndex].distance > targetDistance) {
      startIndex--;
    }

    const start = allPoints[startIndex];
    const deltaElevation = current.elevation - start.elevation;
    const deltaDistanceMeters = (current.distance - start.distance) * 1000;

    const slope =
      deltaDistanceMeters > 0
        ? (deltaElevation / deltaDistanceMeters) * 100
        : 0;

    result.push({
      distance: current.distance,
      point: current,
      slope,
      slopeType: slope > 0 ? 'up' : 'down',
    });
  }

  return result;
}

function detectRollingSlopeTransitions(
  points: {
    distance: number;
    point: GpxPoint;
    slope: number;
    slopeType: SlopeType;
  }[],
  minSegmentLengthKm: number
): SlopeTransition[] {
  if (!points.length) return [];

  const transitions: SlopeTransition[] = [];
  let currentType: SlopeType = points[0].slopeType;

  for (let i = 1; i < points.length; i++) {
    const iType = points[i].slopeType;

    if (iType === currentType) continue;

    const lastFuturPointsIndex = points.findIndex(
      (el) => el.distance > points[i].distance + minSegmentLengthKm
    );
    const futurePoints = points.slice(i, lastFuturPointsIndex);
    const sameTypeAsIt = futurePoints.filter((p) => p.slopeType == iType);
    const ratio = sameTypeAsIt.length / futurePoints.length;

    if (ratio < 0.7) continue;

    const zones: GpxPoint[] = points
      .slice(i - 10, i + 10)
      .reduce((acc, curr) => {
        return [...acc, curr.point];
      }, []);
    const type = currentType === 'up' ? 'summit' : 'valley';
    const distance = detectExactTransitionDistance(zones, type);

    const transition: SlopeTransition = {
      startPoint: points[i - 1],
      endPoint: points[i],
      transitionType: currentType === 'up' ? 'summit' : 'valley',
      distance,
    };

    transitions.push(transition);
    currentType = iType;
  }

  return transitions;
}

function detectExactTransitionDistance(
  points: GpxPoint[],
  transitionType: 'summit' | 'valley'
): number {
  if (points.length === 0) return 0;
  if (transitionType === 'summit') {
    // retourne le point avec la plus grande altitude
    return points.reduce(
      (maxPoint, p) => (p.elevation >= maxPoint.elevation ? p : maxPoint),
      points[0]
    ).distance;
  } else {
    // retourne le point avec la plus petite altitude
    return points.reduce(
      (minPoint, p) => (p.elevation <= minPoint.elevation ? p : minPoint),
      points[0]
    ).distance;
  }
}
