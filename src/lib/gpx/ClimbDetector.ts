import { GpxParse } from '@/lib/gpx/GpxParse';
import {
  getPoints,
  getSlope,
  getSlopeDiff,
  getSlopeType,
} from '@/lib/gpx/Metrics';
import { chunkerizeSegments } from '@/lib/gpx/Segments';
import { ComputeSegmentSlope } from '@/lib/gpx/SlopeMetrix';
import { roundOneNumber } from '@/lib/utils';
import { GpxPoint } from '@/types/GpxPoint';
import { GpxSegment } from '@/types/GpxSegment';
import { SlopeTransition, SlopeType } from '@/types/Slope';

export interface SegmentTransition {
  type: 'summit' | 'valley';
  distance: number;
}

export class ClimbDetector {
  public separators: number[];

  constructor(xml: string) {
    const parsed = new GpxParse(xml);
    const smoothedPointsMeters = parsed.smoothedPointsMeters;
    const chunks = chunkerizeSegments(smoothedPointsMeters, 100);
    const segments = ComputeSegmentSlope(chunks);
    const merged = mergeSegments(segments);
    const transitions = detectRollingSlopeTransitions(merged);
    this.separators = transitions.map((el) =>
      roundOneNumber(el.distance / 1000)
    );
  }
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
