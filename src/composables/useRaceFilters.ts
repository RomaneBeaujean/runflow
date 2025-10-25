// src/composables/useRace.ts
import { ref } from 'vue';

const sticky = ref<boolean>(false);

export function useRaceFilters() {
  return {
    sticky,
  };
}
