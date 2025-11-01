import { useEcharts } from '@/composables/useEcharts';
import { useRaceMetrics } from '@/composables/useRaceMetrics';
import { Split } from '@/types/Split';
import { ref } from 'vue';

const { getSplitFromDistance } = useRaceMetrics();
const { getTargetDistance } = useEcharts();

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
