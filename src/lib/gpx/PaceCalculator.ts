import { SlidingSlopePoint } from '@/types/Slope';
import { Split } from '@/types/Split';
import { kmhToPace, numberToPace, paceToKmh } from '../time';
import { computeSlidingSlopeKm } from './SlopeMetrix';

export class PaceCalculator {
  totalDistance: number;
  points: SlidingSlopePoint[];
  slopeMin: number;
  slopeMax: number;

  constructor({ points, totalDistance, slopeMin, slopeMax }) {
    this.points = computeSlidingSlopeKm(points, 0.3);
    this.totalDistance = totalDistance;
    this.slopeMax = slopeMax;
    this.slopeMin = slopeMin;
  }

  createSpeedModel({
    vMax,
    sOpt,
    pUp,
    pDown,
    slopeMin,
    vMinDown,
    slopeMax,
    vMinUp,
  }) {
    const aL =
      -Math.log(vMinDown / vMax) / Math.pow(Math.abs(slopeMin - sOpt), pDown);
    const aR =
      -Math.log(vMinUp / vMax) / Math.pow(Math.abs(slopeMax - sOpt), pUp);
    return function getSpeed(slope: number) {
      const a = slope <= sOpt ? aL : aR;
      const p = slope <= sOpt ? pDown : pUp;
      const v = vMax * Math.exp(-a * Math.pow(Math.abs(slope - sOpt), p));
      return Math.max(0, Math.min(v, vMax));
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
      slopeMin: this.slopeMin,
      slopeMax: this.slopeMax,
      vMax,
      vMinDown,
      vMinUp,
    });

    const pacedPoints = this.points.map((p, idx) => {
      const pace = kmhToPace(findPaceFromSlopeFn(p.slope));
      const distance =
        idx === 0 ? 0 : p.distance - this.points[idx - 1].distance;
      return {
        ...p,
        pace,
        duration: pace * distance,
      };
    });

    const duration = pacedPoints.reduce((acc, s) => acc + s.duration, 0);
    const durationTarget = avg ? this.totalDistance * avg : null;
    const correctionFactor = avg ? durationTarget / duration : 1;

    const adjustedPoints = pacedPoints.map((p) => ({
      ...p,
      pace: p.pace * correctionFactor,
      duration: p.duration * correctionFactor,
    }));

    return splits.map((split: Partial<Split>) => {
      const splitPoints = adjustedPoints.filter(
        (p) =>
          p.distance >= split.startDistance && p.distance <= split.endDistance
      );
      const totalDistance = split.endDistance - split.startDistance;
      const totalDuration = splitPoints.reduce((acc, p) => acc + p.duration, 0);
      const pace = numberToPace(totalDuration / totalDistance);

      const splitWithPace: Split = {
        startDistance: split.startDistance,
        endDistance: split.endDistance,
        pace,
      };

      return splitWithPace;
    });
  }
}
