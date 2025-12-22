import { getTotalDuration } from '@/domain/GpxMetrics';
import { GpxParse } from '@/domain/GpxParse';
import { GpxPoint } from '@/types/GpxPoint';
import { Split } from '@/types/Split';
import { Separator } from '@/types/entities/Separator';

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

  constructor(data?: Partial<Race>) {
    this.id = data?.id ?? '';
    this.name = data?.name ?? '';
    this.createdAt = data?.createdAt ?? new Date().toISOString();
    this.gpxContent = data?.gpxContent ?? '';
    this.splits =
      data?.splits?.sort((a, b) => a.startDistance - b.startDistance) ?? [];
    this.separators =
      data?.separators?.sort((a, b) => a.distance - b.distance) ?? [];
    this.startTime = data?.startTime ? new Date(data.startTime) : null;
    this.date = data?.date ? new Date(data.date) : null;
  }

  get totalDuration() {
    return getTotalDuration(this.splits, this.separators);
  }

  get totalDistance() {
    return new GpxParse(this.gpxContent).totalDistance;
  }

  get totalElevation() {
    return new GpxParse(this.gpxContent).totalElevation;
  }
}
