import { useEcharts } from '@/composables/useEcharts';
import { useRaceMetrics } from '@/composables/useRaceMetrics';
import { Split } from '@/types/Split';
import { ref } from 'vue';

const { getSplitFromDistance, getSeparatorFromDistance } = useRaceMetrics();
const { getTargetDistance } = useEcharts();

const hoveredSplit = ref<Split | null>(null);

export default function useRaceChartSplitHover() {
  const onChartHover = (event: any) => {
    const targetDistance = getTargetDistance(event);
    if (!getSeparatorFromDistance(targetDistance)) {
      const targetSplit = getSplitFromDistance(targetDistance);
      hoveredSplit.value = targetSplit;
    } else {
      hoveredSplit.value = null;
    }
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
