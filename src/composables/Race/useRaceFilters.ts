// src/composables/useRace.ts
import { ref } from 'vue';

const sticky = ref<boolean>(false);
const editableMode = ref<boolean>(true);

export function useRaceFilters() {
  return {
    sticky,
    editableMode,
  };
}
