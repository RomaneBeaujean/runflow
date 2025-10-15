export interface TableRowItem {
  id: string;
  refuel: boolean;
  index: number;

  distance: number;
  cumulElevation: number;
  cumulDuration: number;
  cumulNegativeElevation: number;

  timeBarrier: number;
  timeBarrierTime: Date;

  splitDistance: number;
  splitElevation: number;
  splitPace: string;
  splitDuration: number;
  splitNegativeElevation: number;
  splitSlopePercent: string | null;

  time: Date | null;
}
