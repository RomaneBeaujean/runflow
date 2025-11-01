import { GpxPoint } from '@/types/GpxPoint';
import GpxParser, { Point } from 'gpxparser';
import { roundOneNumber, roundThreeNumber } from '../utils';

export class GpxParse {
  public points: GpxPoint[];
  public pointsMeters: GpxPoint[];
  public smoothedPoints: GpxPoint[];
  public smoothedPointsMeters: GpxPoint[];
  public totalDistance: number;

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
  }

  get totalElevation() {
    return this.points[this.points.length - 1].cumulElevation;
  }

  get totalNegativeElevation() {
    return this.points[this.points.length - 1].cumulNegativeElevation;
  }
}

function smoothPointsByDistance(data: GpxPoint[], distanceMeters: number) {
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
