import { ref, watch } from 'vue';
import { useViewport } from './useViewport';

const { isMobile } = useViewport();

const editableMode = ref<boolean>(true);
const stickyChart = ref<boolean>(false);
const showSlopeAreaColor = ref<boolean>(false);
const showPaceLine = ref<boolean>(true);
const showSeparator = ref<boolean>(true);
const showSeparatorDistance = ref<boolean>(true);
const showSeparatorDuration = ref<boolean>(true);
// Hovered Point
const showPointSlope = ref<boolean>(true);
const showPointPace = ref<boolean>(true);
const showPointDuration = ref<boolean>(true);
const showPointTime = ref<boolean>(true);

watch(
  isMobile,
  () => {
    if (isMobile.value) {
      showSeparator.value = false;
      showSeparatorDuration.value = false;
      showSeparatorDistance.value = false;
    } else {
      showSeparator.value = true;
      showSeparatorDuration.value = true;
      showSeparatorDistance.value = true;
    }
  },
  { immediate: true }
);

export function useRaceChartParams() {
  return {
    stickyChart,
    editableMode,
    showSlopeAreaColor,
    showPaceLine,
    showSeparatorDistance,
    showSeparator,
    showSeparatorDuration,
    showPointSlope,
    showPointTime,
    showPointPace,
    showPointDuration,
  };
}
