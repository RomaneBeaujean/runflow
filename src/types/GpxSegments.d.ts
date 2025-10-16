export type SlopeType = 'up' | 'down' | 'flat';

export interface GpxSegment {
  startIndex: number;
  endIndex: number;
  type: SlopeType;
}
