<template>
  <div
    v-if="position && split"
    :style="{
      position: 'absolute',
      left: position.left,
      top: '20px',
      transform: 'translate(-50%, -50%)',
    }"
    :key="split.startDistance"
  >
    <div class="min-w-[100px] flex justify-center items-center gap-2">
      <!-- Tag Distance -->
      <div
        class="flex items-center gap-1 bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
      >
        <i class="pi pi-arrows-h text-pink-600"></i>
        <span>{{ distance }} km</span>
      </div>

      <!-- Tag D+ -->
      <div
        class="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
      >
        <i class="pi pi-chart-line text-orange-600"></i>
        <span>{{ elevation }} d+</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGpxMetrics } from '@/composables/useGpxMetrics';
import { roundOneNumber } from '@/lib/utils';
import { Position } from '@/types/Position';
import { Split } from '@/types/Split';
import { computed } from 'vue';

const props = defineProps<{
  position: Position | null;
  split: Split | null;
}>();

const { getElevationFromSplit } = useGpxMetrics();

const distance = computed(() => {
  return roundOneNumber(props.split!.endDistance - props.split!.startDistance);
});

const elevation = computed(() => {
  return getElevationFromSplit(props.split!);
});
</script>
