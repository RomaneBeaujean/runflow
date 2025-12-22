import { GpxParse, smoothPointsByDistance } from '@/domain/GpxParse';
import { GpxPoint } from '@/types/GpxPoint';
import { SlidingSlopePoint, SlopeType } from '@/types/Slope';
import { roundOneNumber } from './helpers/RoundNumbers.helper';
import { computeSlidingSlopeKm } from './Slopes';

type TransitionType = 'summit' | 'valley';

export class ClimbDetector {
  public separators: number[];

  constructor(
    parsedFile: GpxParse,
    smoothWindowSizeKm = 1,
    slidingSlopeSizeKm = 0.2,
    transitionWindowSizeKm = 0.5
  ) {
    const exactPoints = parsedFile.points.sort(
      (a, b) => a.distance - b.distance
    );
    const smoothedPoints = smoothPointsByDistance(
      exactPoints,
      smoothWindowSizeKm
    );
    const points = computeSlidingSlopeKm(smoothedPoints, slidingSlopeSizeKm);

    this.separators = detectTransitions(
      exactPoints,
      points,
      transitionWindowSizeKm
    );
  }
}

const detectTransitions = (
  exactPoints: GpxPoint[],
  points: SlidingSlopePoint[],
  windowSize: number
): number[] => {
  // -----------------------------
  // 1️⃣ Détection brute des transitions
  // -----------------------------

  const rawTransitions: number[] = [];

  let currentType: SlopeType = points[0].slopeType;
  let pointIndex = 0;

  while (pointIndex < points.length) {
    const point = points[pointIndex];
    const lastTransition = rawTransitions[rawTransitions.length - 1] ?? null;

    if (shouldSkipPoint(point, currentType, lastTransition)) {
      pointIndex++;
      continue;
    }

    const exactDistance = computeExactTransitionDistance(
      point,
      exactPoints,
      windowSize,
      currentType
    );

    if (shouldSkipTransition(exactDistance, lastTransition)) {
      pointIndex++;
      continue;
    }

    rawTransitions.push(exactDistance);
    currentType = point.slopeType;
    pointIndex = skipToNextPointBeyond(points, pointIndex, exactDistance);
  }

  // -----------------------------
  // 2️⃣ Nettoyage et fusion des segments trop courts
  // -----------------------------

  const cleaned: number[] = [];

  for (let i = 0; i < rawTransitions.length; i++) {
    const currDist = rawTransitions[i];
    const startDist = i === 0 ? 0 : cleaned[cleaned.length - 1];
    const segmentDistance = currDist - startDist;

    // -----------------------------
    // Segment normal → on garde
    // -----------------------------
    if (segmentDistance >= 1 || i === 0) {
      cleaned.push(currDist);
      continue;
    }

    // -----------------------------
    // Segment trop petit → on décide du merge
    // -----------------------------
    const prevSegmentStartDist = i >= 2 ? cleaned[cleaned.length - 2] : 0;
    const prevSlope = getSegmentSlope(points, prevSegmentStartDist, startDist);
    const prevSlopeType =
      prevSlope !== null ? getStrictSlopeType(prevSlope) : null;

    const nextSegmentEndDist =
      i < rawTransitions.length - 1
        ? rawTransitions[i + 1]
        : points[points.length - 1].distance;
    const nextSlope = nextSegmentEndDist
      ? getSegmentSlope(points, currDist, nextSegmentEndDist)
      : null;
    const nextSlopeType =
      nextSlope !== null ? getStrictSlopeType(nextSlope) : null;

    const currSlope = getSegmentSlope(points, startDist, currDist);
    const currSlopeType =
      currSlope !== null ? getStrictSlopeType(currSlope) : null;

    // -----------------------------
    // 3️⃣ Choix du merge
    // -----------------------------

    if (
      prevSlopeType &&
      nextSlopeType &&
      prevSlopeType === nextSlopeType &&
      Math.abs(prevSlope - nextSlope) < 10
    ) {
      // Fusion avec les 3 segments (précédent + courant + suivant)
      cleaned.pop();
      continue;
    } else if (
      currSlopeType &&
      nextSlopeType &&
      currSlopeType === nextSlopeType
    ) {
      if (currDist > 68 && currDist < 69) {
      }
      // Fusion avec le segment suivant → ne pas ajouter cette transition
      continue;
    } else {
      if (currDist > 68 && currDist < 69) {
      }
      // Fusion avec le segment précédent → remplacer la précédente
      cleaned.pop();
      cleaned.push(currDist);
      continue;
    }
  }

  return cleaned;
};

function detectExactTransitionDistance(
  points: GpxPoint[],
  transitionType: 'summit' | 'valley'
): number {
  if (points.length === 0) return 0;
  if (transitionType === 'summit') {
    return points.reduce(
      (maxPoint, p) => (p.elevation >= maxPoint.elevation ? p : maxPoint),
      points[0]
    ).distance;
  } else {
    return points.reduce(
      (minPoint, p) => (p.elevation <= minPoint.elevation ? p : minPoint),
      points[0]
    ).distance;
  }
}

function shouldSkipPoint(
  point: SlidingSlopePoint,
  currentType: SlopeType,
  lastTransition: number | null
): boolean {
  if (point.slopeType === currentType) return true;
  if (point.distance < 1) return true;
  if (lastTransition && lastTransition >= point.distance) return true;
  return false;
}

function skipToNextPointBeyond(
  points: SlidingSlopePoint[],
  index: number,
  exactDistance: number
): number {
  while (index < points.length && points[index].distance <= exactDistance) {
    index++;
  }
  return index;
}

function shouldSkipTransition(
  exactDistance: number,
  lastTransition: number | null
): boolean {
  return lastTransition !== null && exactDistance <= lastTransition;
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

function computeExactTransitionDistance(
  point: SlidingSlopePoint,
  exactPoints: GpxPoint[],
  windowSize: number,
  currentType: SlopeType
): number {
  const half = windowSize / 2;
  const start = point.distance - half;
  const end = point.distance + half;

  const startIndex = exactPoints.findIndex((p) => p.distance >= start);
  const endIndex = exactPoints.findIndex((p) => p.distance >= end);

  const transitionPoints = exactPoints.slice(startIndex, endIndex);
  const transitionType = getTransitionType(currentType, point.slopeType);

  return detectExactTransitionDistance(transitionPoints, transitionType);
}

const getSegmentSlope = (
  points: SlidingSlopePoint[],
  startDistance: number,
  endDistance: number
): number => {
  const startPoint = points.find((el) => el.distance >= startDistance)?.point;
  const endPoint = points.find((el) => el.distance >= endDistance)?.point;

  if (!startPoint || !endPoint) return null;

  const deltaElevation = endPoint.elevation - startPoint.elevation;
  const deltaDistance = roundOneNumber(
    (endPoint.distance - startPoint.distance) * 1000
  );
  const slope =
    deltaDistance > 0
      ? roundOneNumber((deltaElevation / deltaDistance) * 100)
      : 0;

  return slope;
};

const getStrictSlopeType = (slope: number): SlopeType => {
  if (slope > 0) return 'up';
  return 'down';
};
