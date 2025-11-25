import { ref } from 'vue';

const editableMode = ref<boolean>(true);
const stickyChart = ref<boolean>(false);
const showSlopeAreaColor = ref<boolean>(false);
const showPaceLine = ref<boolean>(true);
const showSeparatorDuration = ref<boolean>(true);
// Hovered Point
const showPointSlope = ref<boolean>(true);
const showPointPace = ref<boolean>(true);
const showPointDuration = ref<boolean>(true);
const showPointTime = ref<boolean>(true);

export function useRaceChartParams() {
  return {
    stickyChart,
    editableMode,
    showSlopeAreaColor,
    showPaceLine,
    showSeparatorDuration,
    showPointSlope,
    showPointTime,
    showPointPace,
    showPointDuration,
  };
}
