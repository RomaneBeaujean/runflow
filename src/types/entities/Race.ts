import { Split } from '../Split';
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

  constructor(data?: Partial<Race>) {
    this.id = data?.id ?? '';
    this.name = data?.name ?? '';
    this.createdAt = data?.createdAt ?? new Date().toISOString();
    this.gpxContent = data?.gpxContent ?? '';
    this.splits = data?.splits ?? [];
    this.separators = data?.separators ?? [];
    this.startTime = data?.startTime ? new Date(data.startTime) : null;
    this.date = data?.date ? new Date(data.date) : null;
  }
}
