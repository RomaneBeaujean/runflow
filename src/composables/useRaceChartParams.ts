import { ref } from 'vue';

const editableMode = ref<boolean>(true);
const stickyChart = ref<boolean>(false);
const showSlopeAreaColor = ref<boolean>(false);
const showSeparatorDuration = ref<boolean>(true);
const showPointSlope = ref<boolean>(true);
const showPointPace = ref<boolean>(true);
const showPointDuration = ref<boolean>(true);
const showPointTime = ref<boolean>(true);

export function useRaceChartParams() {
  return {
    stickyChart,
    editableMode,
    showSlopeAreaColor,
    showSeparatorDuration,
    showPointSlope,
    showPointTime,
    showPointPace,
    showPointDuration,
  };
}
