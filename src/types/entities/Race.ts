import { GpxParse } from '@/lib/gpx/GpxParse';
import { getTotalDuration } from '@/lib/gpx/Metrics';
import { roundOneNumber } from '@/lib/utils';
import { GpxPoint } from '@/types/GpxPoint';
import { Split } from '@/types/Split';
import { Separator } from './Separator';

export class Race {
  id: string;
  name: string;
  createdAt: string;
  gpxContent: string;
  splits: Split[];
  separators: Separator[];
  date: Date | null;
  startTime: Date | null;
  points: GpxPoint[];
  totalDistance: number;
  totalElevation: number;

  constructor(data?: Partial<Race>) {
    this.id = data?.id ?? '';
    this.name = data?.name ?? '';
    this.createdAt = data?.createdAt ?? new Date().toISOString();
    this.gpxContent = data?.gpxContent ?? '';
    this.splits = data?.splits ?? [];
    this.separators = data?.separators ?? [];
    this.startTime = data?.startTime ? new Date(data.startTime) : null;
    this.date = data?.date ? new Date(data.date) : null;
    if (this.gpxContent) {
      const { smoothedPoints, totalDistance, totalElevation } = new GpxParse(
        this.gpxContent
      );
      this.points = smoothedPoints;
      this.totalDistance = roundOneNumber(totalDistance);
      this.totalElevation = Math.round(totalElevation);
    }
  }

  get totalDuration() {
    return getTotalDuration(this.splits, this.separators);
  }

  get maxElevation() {
    return Math.max(...this.points.map((el) => el.elevation));
  }

  get minElevation() {
    return Math.min(...this.points.map((el) => el.elevation));
  }
}
