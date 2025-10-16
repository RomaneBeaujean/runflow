import { GpxPoint } from '@/types/GpxPoint';
import GpxParser, { Point } from 'gpxparser';
import { roundOneNumber } from './utils';

export type SlopeType = 'up' | 'down' | 'flat';

export interface SlidingSlopePoint {
  distance: number;
  point: GpxPoint;
  slope: number;
  slopeType: SlopeType;
}

export class ClimbDetector {
  private gpxParser = new GpxParser();
  public points: GpxPoint[];
  public smoothedPoints: GpxPoint[];
  public slidingSlopePoints: SlidingSlopePoint[];
  public transitions: number[];

  constructor(xml: string) {
    this.gpxParser.parse(xml);
    this.points = this.extractPoints();
    this.smoothedPoints = smoothByDistance(this.points, 20);
    this.slidingSlopePoints = computeSlidingSlope(this.smoothedPoints, 50);
    this.transitions = detectTransitions(this.slidingSlopePoints, 500, 300);
  }

  private extractPoints(): GpxPoint[] {
    const distanceCumul = this.gpxParser.tracks[0]?.distance.cumul;
    let cumulElevation = 0;
    let cumulNegativeElevation = 0;

    return this.gpxParser.tracks[0].points.map((point: Point, index) => {
      const exactDistance = index === 0 ? 0 : distanceCumul[index];

      if (index > 0) {
        const prev = this.gpxParser.tracks[0].points[index - 1];
        const diff = point.ele - prev.ele;
        if (diff > 0) cumulElevation += diff;
        else cumulNegativeElevation += Math.abs(diff);
      }

      return {
        distance: exactDistance,
        elevation: point.ele,
        cumulElevation: cumulElevation,
        cumulNegativeElevation: cumulNegativeElevation,
      };
    });
  }
}

function smoothByDistance(data: GpxPoint[], distanceMeters: number) {
  const totalDistance = data[data.length - 1].distance;
  const smoothed = [];
  for (let i = 0; i < data.length; i++) {
    const currDistance = data[i].distance;
    const startDistance = currDistance - distanceMeters / 2;
    const endDistance = Math.min(
      currDistance + distanceMeters / 2,
      totalDistance
    );

    const startDistanceIndex = data.findIndex(
      (el) => el.distance >= startDistance
    );
    const endDistanceIndex = data.findIndex((el) => el.distance >= endDistance);

    const start = Math.max(0, startDistanceIndex);
    const end = endDistanceIndex;

    const subset = data.slice(start, end);
    const avgElevation =
      subset.reduce((sum, p) => sum + p.elevation, 0) / subset.length;

    smoothed.push({ ...data[i], elevation: avgElevation });
  }
  return smoothed;
}

function computeSlidingSlope(
  points: GpxPoint[],
  windowSizeMeters: number
): SlidingSlopePoint[] {
  if (points.length < 2) return [];
  const totalDistance = points[points.length - 1].distance;

  let slidingSlopePoints = [];

  for (let i = 0; i < points.length; i++) {
    const current = points[i];

    const currDistance = points[i].distance;
    const startDistance = Math.max(0, currDistance - windowSizeMeters / 2);
    const endDistance = Math.min(
      currDistance + windowSizeMeters / 2,
      totalDistance
    );
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
    });
  }

  return slidingSlopePoints;
}

const getSlopeType = (slope: number): SlopeType => {
  if (slope >= 1) return 'up';
  if (slope <= -1) return 'down';
  return 'flat';
};

const detectTransitions = (
  points: SlidingSlopePoint[],
  minimumSegmentLength: number,
  sampleSegmentLength: number
): number[] => {
  let transitions = [];
  const sampleEndIndex = points.findIndex(
    (el) => el.distance >= sampleSegmentLength
  );
  const firstSample = points.slice(0, sampleEndIndex);
  let segmentType = getSlopeType(getSlopeAverage(firstSample));
  let startSegmentDistance = 0;
  let currentAverage = getSlopeAverage(firstSample);

  for (let i = 0; i < points.length; i++) {
    const segmentLength = points[i].distance - startSegmentDistance;

    if (
      points[i].slopeType === segmentType ||
      segmentLength < minimumSegmentLength
    )
      continue;
    let endIndex = points.findIndex(
      (el) => el.distance >= points[i].distance + sampleSegmentLength
    );
    if (endIndex < 0) endIndex = points.length - 1;

    const nextSegmentPoints = points.slice(i, endIndex);
    const nextSlopeAverage = getSlopeAverage(nextSegmentPoints);
    const nextType = getSlopeType(nextSlopeAverage);

    const averageDiff =
      Math.max(nextSlopeAverage, currentAverage) -
      Math.min(nextSlopeAverage, currentAverage);

    if (nextType === segmentType || averageDiff < 5) continue;

    const transitionType =
      segmentType === 'down'
        ? 'valley'
        : segmentType === 'up'
          ? 'summit'
          : nextType === 'down'
            ? 'summit'
            : 'valley';

    const exactDistance = detectExactTransitionDistance(
      nextSegmentPoints,
      transitionType
    );
    const distanceKm = roundOneNumber(exactDistance / 1000);
    transitions.push(distanceKm);
    currentAverage = nextSlopeAverage;
    segmentType = nextType;
    startSegmentDistance = exactDistance;
  }

  return transitions;
};

const getSlopeAverage = (points: SlidingSlopePoint[]) => {
  const nextPointsSlopeAverage =
    points.reduce((sum, p) => sum + p.slope, 0) / points.length;

  return nextPointsSlopeAverage;
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
