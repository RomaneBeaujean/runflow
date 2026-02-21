import { GpxPoint } from './GpxPoint';
import { SlopeType } from './Slope';

export interface GpxSegment {
  startDistance: number;
  endDistance: number;
  distance: number;
  slope: number;
  slopeType: SlopeType;
  points: GpxPoint[];
}
