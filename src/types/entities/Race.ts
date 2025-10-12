import { Separator } from '../Separator';
import { Split } from '../Split';

export class Race {
  id: string;
  name: string;
  createdAt: string;
  trackId: string;
  splits: Split[];
  separators: Separator[];

  constructor(data?: Partial<Race>) {
    this.id = data?.id ?? '';
    this.name = data?.name ?? '';
    this.createdAt = data?.createdAt ?? new Date().toISOString();
    this.trackId = data?.trackId ?? '';
    this.splits = data?.splits ?? [];
    this.separators = data?.separators ?? [];
  }
}
