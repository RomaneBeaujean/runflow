import { ref } from 'vue';

const showModal = ref(false);

export function useRaceRecap() {
  return {
    showModal,
  };
}
