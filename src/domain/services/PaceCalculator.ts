import {
  kmhToPace,
  numberToPace,
  paceToKmh,
} from '@/domain/helpers/Time.helper';
import { chunkerizeSegments } from '@/domain/services/Segments';
import { computeSegmentSlopeKm } from '@/domain/services/Slopes';
import { GpxPoint } from '@/domain/types/GpxPoint';
import { Split } from '@/domain/types/Split';
import { GpxParse } from './GpxParse';

export interface SplitWithDuration {
  startDistance: number;
  endDistance: number;
  pace: string;
  duration: number;
}

export class PaceCalculator {
  totalDistance: number;
  points: GpxPoint[];
  slopeMin: number;
  slopeMax: number;

  constructor(parsedFile: GpxParse) {
    this.points = parsedFile.smoothedPoints;
    this.totalDistance = parsedFile.totalDistance;
    this.slopeMax = parsedFile.slopeMax;
    this.slopeMin = parsedFile.slopeMin;
  }

  createSpeedModel({ vMax, sOpt, pUp, pDown, vMinDown, vMinUp }) {
    const aL =
      -Math.log(vMinDown / vMax) /
      Math.pow(Math.abs(this.slopeMin - sOpt), pDown);
    const aR =
      -Math.log(vMinUp / vMax) / Math.pow(Math.abs(this.slopeMax - sOpt), pUp);
    return function getPace(slope: number) {
      const a = slope <= sOpt ? aL : aR;
      const p = slope <= sOpt ? pDown : pUp;
      const v = vMax * Math.exp(-a * Math.pow(Math.abs(slope - sOpt), p));
      const speed = Math.max(0, Math.min(v, vMax));
      return kmhToPace(speed);
    };
  }

  calculateSplitPace({
    splits,
    avg,
    maxPace,
    downMinPace,
    upMinPace,
    sOpt,
    pUp,
    pDown,
  }): Split[] {
    const vMax = paceToKmh(maxPace);
    const vMinDown = paceToKmh(downMinPace);
    const vMinUp = paceToKmh(upMinPace);

    const findPaceFromSlopeFn = this.createSpeedModel({
      pUp,
      pDown,
      sOpt,
      vMax,
      vMinDown,
      vMinUp,
    });

    const pacedSplits: SplitWithDuration[] = splits.map(
      (split: Partial<Split>) => {
        const points = this.points.filter(
          (el) =>
            el.distance >= split.startDistance &&
            el.distance <= split.endDistance
        );
        const segments = chunkerizeSegments(points, 0.1);
        const segmentSlope = computeSegmentSlopeKm(segments);
        const segmentPaced = segmentSlope.map((s) => {
          const pace = findPaceFromSlopeFn(s.slope);
          const distance = s.distance;
          const duration = pace * distance;
          return {
            ...s,
            duration,
          };
        });
        const duration = segmentPaced.reduce((acc, s) => acc + s.duration, 0);
        return {
          ...split,
          duration: duration,
        };
      }
    );

    const splitsDuration = pacedSplits.reduce((acc, s) => acc + s.duration, 0);
    const durationTarget = avg ? this.totalDistance * avg : null;
    const correctionFactor = avg ? durationTarget / splitsDuration : 1;

    const finalSplits = pacedSplits.map((split) => {
      const distance = split.endDistance - split.startDistance;
      const duration = split.duration * correctionFactor;
      const pace = numberToPace(duration / distance);

      return {
        startDistance: split.startDistance,
        endDistance: split.endDistance,
        duration,
        pace,
      };
    });

    return finalSplits;
  }
}
