export interface SplitItem {
  id: string;
  refuel: boolean;
  index: number;

  distance: number;
  cumulElevation: number;
  cumulDuration: number;
  cumulNegativeElevation: number;

  timeBarrier: Date;
  timeBarrierDuration: number;
  stopDuration: number;
  timeBarrierValid: boolean;

  split: Split;
  splitDistance: number;
  splitElevation: number;
  splitPace: string;
  splitDuration: number;
  splitNegativeElevation: number;
  splitSlopePercent: string | null;

  time: Date | null;
}
