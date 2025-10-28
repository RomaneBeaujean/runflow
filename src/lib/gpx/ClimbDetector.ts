import { GpxPoint } from '@/types/GpxPoint';
import { roundOneNumber } from '../utils';
import { GpxParse } from './GpxParse';

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
    const totalDistance = parsed.totalDistance;
    const smoothedPointsMeters = parsed.smoothedPointsMeters;
    const chunks = chunkerizeSegments(smoothedPointsMeters, 100);
    const segments = computedSegmentSlope(chunks);
    const merged = mergeSegments(segments);
    const merged2 = mergeSmallDist(merged);
    this.separators = merged2
      .map((m) => roundOneNumber(m.endDistance / 1000))
      .filter((it) => it !== 0 && it !== roundOneNumber(totalDistance));
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

function mergeSegments(segments: GpxSegment[], slopeDiffThreshold = 1) {
  const merged: GpxSegment[] = [];
  let currSegment = { ...segments[0] };
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    const slopeDiff = getSlopeDiff(currSegment.slope, segment.slope);
    if (
      currSegment.slopeType === segment.slopeType ||
      slopeDiff < slopeDiffThreshold
    ) {
      // MERGE
      const points = [...currSegment.points, ...segment.points];
      currSegment.endDistance = segment.endDistance;
      currSegment.distance = getDistance(points);
      currSegment.slope = getSlope(points);
      currSegment.slopeType = getSlopeType(currSegment.slope);
      currSegment.points = points;
    } else {
      merged.push(currSegment);
      currSegment = { ...segment };
    }
  }

  return merged;
}

export function mergeSmallDist(
  segments: GpxSegment[],
  minDistance = 800
): GpxSegment[] {
  let segs = [...segments];

  const mergeTwoSegments = (segA: GpxSegment, segB: GpxSegment): GpxSegment => {
    // Assurer l'ordre par distance
    const mergedPoints =
      segA.startDistance < segB.startDistance
        ? [...segA.points, ...segB.points]
        : [...segB.points, ...segA.points];

    const startDistance = mergedPoints[0].distance;
    const endDistance = mergedPoints[mergedPoints.length - 1].distance;
    const distance = endDistance - startDistance;
    const slope = getSlope(mergedPoints);

    return {
      startDistance,
      endDistance,
      distance,
      slope,
      slopeType: getSlopeType(slope),
      points: mergedPoints,
    };
  };

  while (true) {
    // Trouver le segment le plus petit
    let smallestIndex = -1;
    let smallestDistance = Infinity;

    segs.forEach((seg, idx) => {
      const d = getDistance(seg.points);
      if (d < minDistance && d < smallestDistance) {
        smallestDistance = d;
        smallestIndex = idx;
      }
    });

    if (smallestIndex === -1) break; // plus de petits segments

    const smallSeg = segs[smallestIndex];
    const prevSeg = segs[smallestIndex - 1];
    const nextSeg = segs[smallestIndex + 1];

    let mergedSeg: GpxSegment;

    if (!prevSeg && !nextSeg)
      break; // aucun voisin, impossible
    else if (!prevSeg) {
      mergedSeg = mergeTwoSegments(smallSeg, nextSeg);
      segs.splice(smallestIndex, 2, mergedSeg);
    } else if (!nextSeg) {
      mergedSeg = mergeTwoSegments(prevSeg, smallSeg);
      segs.splice(smallestIndex - 1, 2, mergedSeg);
    } else {
      const prevSlopeDiff = getSlopeDiff(prevSeg.slope, smallSeg.slope);
      const nextSlopeDiff = getSlopeDiff(nextSeg.slope, smallSeg.slope);

      if (
        prevSeg.slopeType === smallSeg.slopeType ||
        prevSlopeDiff <= nextSlopeDiff
      ) {
        mergedSeg = mergeTwoSegments(prevSeg, smallSeg);
        segs.splice(smallestIndex - 1, 2, mergedSeg);
      } else {
        mergedSeg = mergeTwoSegments(smallSeg, nextSeg);
        segs.splice(smallestIndex, 2, mergedSeg);
      }
    }
  }

  return segs;
}

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
