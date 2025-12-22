import { ref } from 'vue';

const viewportSize = ref<number | null>(null);
const isMobile = ref<boolean>(false);

export function useViewport() {
  const handleViewport = () => {
    viewportSize.value = window.innerWidth;
    isMobile.value = (viewportSize.value ?? 0) < 900 ? true : false;
  };

  handleViewport();
  window.addEventListener('resize', handleViewport);

  return {
    viewportSize,
    isMobile,
  };
}
