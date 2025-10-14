import { Position } from '@/types/Position';
import { Split } from '@/types/Split';
import { ref } from 'vue';

const hoveredSplit = ref<Split | null>(null);
const hoveredSplitTooltipPosition = ref<Position | null>(null);

export default function useRaceHoveredSplit() {
  const setHoveredSplit = (split: Split | null) => {
    if (split == hoveredSplit.value) return;
    hoveredSplit.value = split;
  };

  const setHoveredSplitTooltipPosition = (position: Position) => {
    hoveredSplitTooltipPosition.value = position;
  };

  return {
    hoveredSplit,
    hoveredSplitTooltipPosition,
    setHoveredSplit,
    setHoveredSplitTooltipPosition,
  };
}
