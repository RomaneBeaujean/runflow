import { TagColor } from '@/domain/types/TagColor';

export interface Sport {
  id: string;
  label: string;
  icon: string;
  color: TagColor;
  background: string;
}
