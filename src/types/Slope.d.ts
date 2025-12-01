export interface SlopeTransition {
  transitionType: 'summit' | 'valley';
  distance: number;
}

export type SlopeType = 'up' | 'down' | 'flat';

export type SlopeSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface SlidingSlopePoint {
  distance: number;
  point: GpxPoint;
  slope: number;
  slopeSize: SlopeSize;
  slopeType: SlopeType;
}
