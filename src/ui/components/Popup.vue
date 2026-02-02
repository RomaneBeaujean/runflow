<template>
  <div ref="popupRef" :class="[
    'fixed left-0 top-0 z-9999 transition-opacity duration-300',
    opened ? 'block pointer-events-auto' : 'hidden pointer-events-none',
    visible ? 'opacity-100' : 'opacity-0',
  ]" :style="{ top: position.top, left: position.left, width: fullwidth ? parentWidth : 'auto' }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { findPosition, getWidth, isVisible } from '@/domain/helpers/position';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

interface Position {
  top: string;
  left: string;
}

export type Placement =
  | 'bottom' | 'top' | 'left' | 'right'
  | 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  | 'left-start' | 'left-end' | 'right-start' | 'right-end';

const props = defineProps<{
  opened: boolean
  fullwidth?: boolean
  placement?: Placement
}>();

const emit = defineEmits<{
  (e: 'update:opened', value: boolean): void
}>();

let resizeObserver: ResizeObserver | null = null;
let mutationObserver: MutationObserver | null = null;

const loaded = ref(false);
const popupRef = ref<HTMLElement>();
const visible = ref(false);
const position = ref<Position>({ top: '0px', left: '0px' });
const currentPlacement = ref<Placement>('bottom');
const parentWidth = ref<string>('auto');

const autoPlacement: Placement[] = [
  'bottom', 'bottom-start', 'bottom-end', 'top', 'top-start', 'top-end',
  'right', 'right-start', 'right-end', 'left', 'left-start', 'left-end'
];

function resolvePlacements(placement: string | undefined): Placement[] {
  if (!placement || placement === 'auto') return autoPlacement;
  return placement.split(',').filter(p => autoPlacement.includes(p as Placement)) as Placement[];
}

const placements = computed((): Placement[] => {
  return resolvePlacements(props.placement);
});

function updatePosition() {
  if (!popupRef.value) return;

  visible.value = false;

  if (props.fullwidth && popupRef.value.parentElement) {
    parentWidth.value = getWidth(popupRef.value.parentElement);
  }

  const bestPosition = findPosition(popupRef.value, placements.value);
  position.value = bestPosition.position;
  currentPlacement.value = bestPosition.placement;
  visible.value = true;
}

function closeWhenInvisible() {
  if (!popupRef.value?.parentElement) return;

  if (!isVisible(popupRef.value.parentElement)) {
    emit('update:opened', false);
  }
}

onMounted(() => {
  if (!popupRef.value) return;

  if (props.opened) updatePosition();

  if (popupRef.value.parentElement) {
    resizeObserver = new ResizeObserver(() => props.opened && updatePosition());
    resizeObserver.observe(popupRef.value.parentElement);
  }

  mutationObserver = new MutationObserver(() => props.opened && updatePosition());
  mutationObserver.observe(popupRef.value, { childList: true, subtree: true });

  window.addEventListener('resize', updatePosition);
  document.addEventListener('scroll', updatePosition, true);
  document.addEventListener('scroll', closeWhenInvisible, true);
  loaded.value = true;
});

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect();
  if (mutationObserver) mutationObserver.disconnect();
  window.removeEventListener('resize', updatePosition);
  document.removeEventListener('scroll', updatePosition, true);
  document.removeEventListener('scroll', closeWhenInvisible, true);
});

watch(() => props.opened, (newValue) => {
  if (newValue) {
    updatePosition();
  }
});
</script>

<style scoped lang="scss"></style>