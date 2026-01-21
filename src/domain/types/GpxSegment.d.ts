export interface GpxSegment {
  startDistance: number;
  endDistance: number;
  distance: number;
  slope: number;
  slopeType: SlopeType;
  points: GpxPoint[];
}
