import { GpxPoint } from '@/types/GpxPoint';
import { roundOneNumber } from '../utils';
import { GpxParse } from './GpxParse';

export interface SegmentTransition {
  type: 'summit' | 'valley';
  distance: number;
}

export interface SlopeTransition {
  transitionType: 'summit' | 'valley';
  distance: number;
}

export interface GpxSegment {
  startDistance: number;
  endDistance: number;
  distance: number;
  slope: number;
  slopeType: SlopeType;
  points: GpxPoint[];
}

export type SlopeType = 'up' | 'down' | 'flat';

export interface SlidingSlopePoint {
  distance: number;
  point: GpxPoint;
  slope: number;
  slopeType: SlopeType;
}

export class ClimbDetector {
  public slidingSlopePoints: SlidingSlopePoint[];
  public separators: number[];

  constructor(xml: string) {
    const parsed = new GpxParse(xml);
    const smoothedPointsMeters = parsed.smoothedPointsMeters;
    const chunks = chunkerizeSegments(smoothedPointsMeters, 100);
    const segments = computedSegmentSlope(chunks);
    const merged = mergeSegments(segments);
    const transitions = detectRollingSlopeTransitions(merged);
    this.separators = transitions.map((el) =>
      roundOneNumber(el.distance / 1000)
    );
  }
}

function chunkerizeSegments(
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

function computedSegmentSlope(segments: GpxPoint[][]): GpxSegment[] {
  return segments.map((seg) => {
    const lastPoint = seg[seg.length - 1];
    const firstPoint = seg[0];
    const elevation = lastPoint.cumulElevation - firstPoint.cumulElevation;
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

function mergeSegments(segments: GpxSegment[], slopeDiffThreshold = 3) {
  const merged: GpxSegment[] = [];
  let currSegment = { ...segments[0] };

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    const slopeDiff = getSlopeDiff(currSegment.slope, segment.slope);
    if (
      currSegment.slopeType === segment.slopeType ||
      slopeDiff < slopeDiffThreshold
    ) {
      currSegment = mergeTwoSegments(currSegment, segment);
    } else {
      merged.push(currSegment);
      currSegment = { ...segment };
    }
  }

  return merged;
}

function detectRollingSlopeTransitions(
  segments: GpxSegment[],
  ratioSegmentLength: number = 1000
): SlopeTransition[] {
  if (!segments.length) return [];

  const transitions: SlopeTransition[] = [];
  let currentType: SlopeType = segments[0].slopeType;

  for (let i = 1; i < segments.length; i++) {
    const iType = segments[i].slopeType;

    if (iType === currentType) continue;

    const lastFuturPointsIndex = segments.findIndex(
      (el) => el.startDistance > segments[i].startDistance + ratioSegmentLength
    );

    const futureSegments = segments.slice(i, lastFuturPointsIndex);
    const sameTypeAsIt = futureSegments.filter((p) => p.slopeType == iType);
    const numberOfSameType = getPoints(sameTypeAsIt).length;
    const numberTotal = getPoints(futureSegments).length;
    const ratio = numberOfSameType / numberTotal;

    if (ratio < 0.6) continue;

    const zones: GpxPoint[] = [
      ...(segments[i - 1] ? segments[i - 1].points : []),
      ...segments[i].points,
      ...(segments[i + 1] ? segments[i + 1].points : []),
    ];
    const type = currentType === 'up' ? 'summit' : 'valley';
    const distance = detectExactTransitionDistance(zones, type);

    const transition: SlopeTransition = {
      transitionType: currentType === 'up' ? 'summit' : 'valley',
      distance,
    };

    transitions.push(transition);
    currentType = iType;
  }

  console.log(transitions);

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

const mergeTwoSegments = (segA: GpxSegment, segB: GpxSegment): GpxSegment => {
  const points =
    segA.startDistance < segB.startDistance
      ? [...segA.points, ...segB.points]
      : [...segB.points, ...segA.points];

  const startDistance = points[0].distance;
  const endDistance = points[points.length - 1].distance;
  const distance = endDistance - startDistance;
  const slope = getSlope(points);
  const slopeType = getSlopeType(slope);

  return {
    startDistance,
    endDistance,
    distance,
    slope,
    slopeType,
    points,
  };
};

const getElevation = (points: GpxPoint[]) => {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const elevation = lastPoint.cumulElevation - firstPoint.cumulElevation;
  return elevation;
};

const getDistance = (points: GpxPoint[]) => {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const distance = lastPoint.distance - firstPoint.distance;
  return distance;
};

const getSlope = (points: GpxPoint[]) => {
  const elevation = getElevation(points);
  const distance = getDistance(points);
  return (elevation / distance) * 100;
};

const getSlopeType = (slope: number): SlopeType => {
  if (slope >= 1) return 'up';
  if (slope <= -1) return 'down';
  return 'flat';
};

const getSlopeDiff = (slopeA: number, slopeB: number) => {
  const averageDiff = Math.max(slopeA, slopeB) - Math.min(slopeA, slopeB);
  return averageDiff;
};

const getPoints = (segments: GpxSegment[]) => {
  return segments.reduce((s, c) => {
    return [...s, ...c.points];
  }, []);
};

// function detectExactTransitionDistance(
//   points: SlidingSlopePoint[],
//   transitionType: 'summit' | 'valley'
// ): number {
//   if (points.length === 0) return 0;
//   if (transitionType === 'summit') {
//     // retourne le point avec la plus grande altitude
//     return points.reduce(
//       (maxPoint, p) =>
//         p.point.elevation >= maxPoint.point.elevation ? p : maxPoint,
//       points[0]
//     ).distance;
//   } else {
//     // retourne le point avec la plus petite altitude
//     return points.reduce(
//       (minPoint, p) =>
//         p.point.elevation <= minPoint.point.elevation ? p : minPoint,
//       points[0]
//     ).distance;
//   }
// }
