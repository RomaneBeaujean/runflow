import { Separator } from './Separator';
import { Split } from './Split';

export interface Race {
  id: string;
  name: string;
  createdAt: string;
  trackId: string;
  splits: Split[];
  separators: Separator[];
}
