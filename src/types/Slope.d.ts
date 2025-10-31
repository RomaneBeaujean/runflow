export interface SlopeTransition {
  transitionType: 'summit' | 'valley';
  distance: number;
}

export type SlopeType = 'up' | 'down' | 'flat';

export interface SlidingSlopePoint {
  distance: number;
  point: GpxPoint;
  slope: number;
  slopeType: SlopeType;
}
