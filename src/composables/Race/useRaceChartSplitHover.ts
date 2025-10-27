import { Split } from '@/types/Split';
import { ref } from 'vue';
import { useEcharts } from './useEcharts';

const { getTargetDistance, getSplitFromDistance } = useEcharts();

const hoveredSplit = ref<Split | null>(null);

export default function useRaceChartSplitHover() {
  const onChartHover = (event: any) => {
    const targetDistance = getTargetDistance(event);
    const targetSplit = getSplitFromDistance(targetDistance);
    if (!targetSplit) return;
    hoveredSplit.value = targetSplit;
  };

  const onChartLeave = () => {
    hoveredSplit.value = null;
  };

  return {
    hoveredSplit,
    onChartLeave,
    onChartHover,
  };
}
