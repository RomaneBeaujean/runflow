import { useGpxParser } from '@/composables/Race/useGpxParser';
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
      const { gpxpoints, gpxtotalDistance, gpxtotalElevation } = useGpxParser(
        this.gpxContent
      );
      this.points = gpxpoints;
      this.totalDistance = roundOneNumber(gpxtotalDistance);
      this.totalElevation = Math.round(gpxtotalElevation);
    }
  }

  get totalDuration() {
    return getTotalDuration(this.splits, this.separators);
  }
}
