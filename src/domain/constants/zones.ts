import { TagColor } from '@/domain/types/TagColor';
import { Zone } from '@/domain/types/Zone';

export const ZONES: Zone[] = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'];

export const ZONES_FC: { zone: Zone; fc: string; color: TagColor }[] = [
  { zone: 'Z1', fc: '101-120 bpm', color: 'green' },
  { zone: 'Z2', fc: '121-140 bpm', color: 'cyan' },
  { zone: 'Z3', fc: '141-160 bpm', color: 'yellow' },
  { zone: 'Z4', fc: '161-180 bpm', color: 'orange' },
  { zone: 'Z5', fc: '181-200 bpm', color: 'red' },
];
