import { ref } from 'vue';

const sticky = ref<boolean>(false);
const editableMode = ref<boolean>(true);
const slopeVisual = ref<boolean>(false);
const showSlopePoint = ref<boolean>(false);

export function useRaceFilters() {
  return {
    sticky,
    editableMode,
    showSlopePoint,
    slopeVisual,
  };
}
