import { getDistance, getSlopeType } from '@/lib/gpx/Metrics';
import { roundOneNumber } from '@/lib/utils';
import { GpxPoint } from '@/types/GpxPoint';
import { GpxSegment } from '@/types/GpxSegment';

export function ComputeSegmentSlope(segments: GpxPoint[][]): GpxSegment[] {
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

export function ComputeSegmentSlopeKm(segments: GpxPoint[][]): GpxSegment[] {
  return segments.map((seg) => {
    const points = seg.sort((a, b) => a.distance - b.distance);
    const lastPoint = points[seg.length - 1];
    const firstPoint = points[0];
    const diffElevation = lastPoint.elevation - firstPoint.elevation;
    const distance = roundOneNumber(lastPoint.distance - firstPoint.distance);
    const distanceMeters = roundOneNumber(distance * 1000);

    const slope =
      distanceMeters > 0 ? (diffElevation / distanceMeters) * 100 : 0;

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
  if (absVal <= 2.5) {
    return '#009966'; // vert
  } else if (absVal <= 5) {
    return '#FEE685'; // jaune
  } else if (absVal <= 7.5) {
    return '#FFDF20'; // jaune foncé
  } else if (absVal <= 10) {
    return '#FF6900'; // orange
  } else if (absVal <= 15) {
    return '#D08700'; // marron
  } else if (absVal <= 20) {
    return '#E7000B'; // rouge
  } else return '#8A0194'; // violet
};
