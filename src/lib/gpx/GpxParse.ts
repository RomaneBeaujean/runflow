import { GpxPoint } from '@/types/GpxPoint';
import GpxParser, { Point } from 'gpxparser';
import { roundOneNumber, roundThreeNumber } from '../utils';
import { computeSlidingSlopeKm } from './SlopeMetrix';

export class GpxParse {
  public points: GpxPoint[];
  public pointsMeters: GpxPoint[];
  public smoothedPoints: GpxPoint[];
  public smoothedPointsMeters: GpxPoint[];
  public totalDistance: number;
  public slopeMax: number;
  public slopeMin: number;

  constructor(xml: string) {
    const gpxParser = new GpxParser();
    gpxParser.parse(xml);

    const track = gpxParser.tracks[0] || gpxParser.routes[0];
    const points = track?.points || [];

    const distanceCumulMeters = track.distance.cumul;
    let cumulElevation = 0;
    let cumulNegativeElevation = 0;

    this.pointsMeters = points.map((point: Point, index) => {
      const exactDistance = index === 0 ? 0 : distanceCumulMeters[index];

      if (index > 0) {
        const prev = points[index - 1];
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

    this.points = this.pointsMeters.map((p) => {
      return {
        distance: roundOneNumber(p.distance / 1000),
        elevation: Math.round(p.elevation),
        cumulElevation: Math.round(p.cumulElevation),
        cumulNegativeElevation: Math.round(p.cumulNegativeElevation),
      };
    });

    this.smoothedPointsMeters = smoothPointsByDistance(this.pointsMeters, 500);

    this.smoothedPoints = this.smoothedPointsMeters.map((p) => {
      return {
        distance: roundThreeNumber(p.distance / 1000),
        elevation: Math.round(p.elevation),
        cumulElevation: Math.round(p.cumulElevation),
        cumulNegativeElevation: Math.round(p.cumulNegativeElevation),
      };
    });

    this.totalDistance = roundOneNumber(track?.distance.total / 1000);

    const slopes = computeSlidingSlopeKm(this.points, 0.5).map((p) => p.slope);
    this.slopeMin = Math.min(...slopes);
    this.slopeMax = Math.max(...slopes);
  }

  get totalElevation() {
    return this.points[this.points.length - 1].cumulElevation;
  }

  get totalNegativeElevation() {
    return this.points[this.points.length - 1].cumulNegativeElevation;
  }
}

export function smoothPointsByDistance(
  data: GpxPoint[],
  windowSize: number
): GpxPoint[] {
  const n = data.length;
  if (n === 0) return [];

  const smoothed: GpxPoint[] = [];
  let start = 0;
  let end = 0;
  let sumElevation = 0;

  for (let i = 0; i < n; i++) {
    const centerDistance = data[i].distance;
    const halfWindow = windowSize / 2;
    const windowStart = centerDistance - halfWindow;
    const windowEnd = centerDistance + halfWindow;

    // Avancer start jusqu’à être dans la fenêtre
    while (start < n && data[start].distance < windowStart) {
      sumElevation -= data[start].elevation;
      start++;
    }

    // Avancer end tant qu’on est dans la fenêtre
    while (end < n && data[end].distance <= windowEnd) {
      sumElevation += data[end].elevation;
      end++;
    }

    const count = end - start;
    const avgElevation = sumElevation / count;

    smoothed.push({
      ...data[i],
      elevation: avgElevation,
    });
  }

  return smoothed;
}
