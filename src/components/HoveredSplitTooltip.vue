<template>
  <div
    v-if="hoveredSplitTooltipPosition"
    :style="{
      position: 'absolute',
      left: hoveredSplitTooltipPosition.left,
      top: '45px',
      transform: 'translate(-50%, -50%)',
    }"
    :key="hoveredSplit.startDistance"
  >
    <div class="flex justify-center items-center gap-2">
      <Tag
        class="font-medium text-sm shadow-sm rounded-full"
        style="background-color: #ffedd4"
      >
        <i class="pi pi-chart-line text-orange-600"></i>
        <span class="text-orange-800"
          >{{ distance }} <small>km</small> / {{ elevation }}
          <small>d+</small></span
        >
      </Tag>

      <Tag
        class="font-medium text-sm shadow-sm rounded-full"
        style="background-color: #fce7f3"
      >
        <i class="pi pi-bolt text-violet-800"></i>
        <span class="text-violet-800">
          <span>{{ hoveredSplit.pace }} <small>min/km</small></span>
        </span>
      </Tag>
      <Tag
        class="font-medium text-sm shadow-sm rounded-full"
        style="background-color: #f0fdf4"
      >
        <i class="pi pi-clock text-emerald-800"></i>
        <span class="text-emerald-800">
          <span>
            {{ minutesToFormattedDuration(getSplitDuration(hoveredSplit)) }}
          </span>
        </span>
      </Tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGpxMetrics } from '@/composables/useGpxMetrics';
import useRaceHoveredSplit from '@/composables/useRaceHoveredSplit';
import { minutesToFormattedDuration } from '@/lib/time';
import { roundOneNumber } from '@/lib/utils';
import { Tag } from 'primevue';
import { computed } from 'vue';

const { hoveredSplit, hoveredSplitTooltipPosition } = useRaceHoveredSplit();
const { getSplitElevation, getSplitDuration } = useGpxMetrics();

const distance = computed(() => {
  return roundOneNumber(
    hoveredSplit.value!.endDistance - hoveredSplit.value!.startDistance
  );
});

const elevation = computed(() => {
  return getSplitElevation(hoveredSplit.value!);
});
</script>
