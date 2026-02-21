import { Metric } from '@/domain/types/Metric';

export const METRICS: Metric[] = [
  {
    type: 'duration',
    label: 'Durée',
    icon: 'pi pi-stopwatch',
  },
  {
    type: 'distance',
    label: 'Distance',
    icon: 'pi pi-arrows-h',
  },
];
