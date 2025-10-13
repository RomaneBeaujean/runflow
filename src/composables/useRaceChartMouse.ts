import { Split } from '@/types/Split';
import { ref } from 'vue';

const hoveredSplit = ref<Split | null>(null);

export default function useRaceChartMouse() {
  return {
    hoveredSplit,
  };
}
