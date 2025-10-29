import { ref } from 'vue';

const showTableModal = ref(false);
const showChartModal = ref(false);

export function useRaceRecap() {
  return {
    showTableModal,
    showChartModal,
  };
}
