export interface Segment {
  name: string;
  startIndex: number;
  endIndex: number;
  startDistance: number;
  endDistance: number;
  distance: number;
  elevation: number;
  pace: string;
  duration: number;
  cumulDistance: number;
  cumulDuration: number;
  cumulElevation: number;
}
