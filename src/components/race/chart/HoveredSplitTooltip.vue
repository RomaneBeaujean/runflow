<template>
  <div
    v-if="hoveredSplitTooltipPosition"
    :style="{
      position: 'absolute',
      left: hoveredSplitTooltipPosition.left,
      top: '20px',
      transform: 'translate(-50%, -50%)',
    }"
    :key="hoveredSplit.startDistance"
  >
    <div class="flex justify-center items-center gap-2">
      <Tag
        style="background-color: #ffedd4; color: var(--color-orange-800)"
        icon="pi pi-arrows-h"
        severity="secondary"
      >
        {{ distance }}
        <small>km</small>
        / {{ elevation }}
        <small>d+</small>
      </Tag>

      <SlopeTag
        :percent="getSplitSlopePercent(hoveredSplit).major"
        icon="pi pi-chart-line"
      />

      <Tag
        style="background-color: #fce7f3; color: var(--color-violet-800)"
        icon="pi pi-bolt"
        severity="secondary"
      >
        <span>{{ hoveredSplit.pace }} <small>min/km</small></span>
      </Tag>

      <Tag
        style="background-color: #f0fdf4; color: var(--color-emeral-800)"
        icon="pi pi-clock"
        severity="secondary"
      >
        <span>
          {{ minutesToFormattedDuration(getSplitDuration(hoveredSplit)) }}
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
import SlopeTag from '../SlopeTag.vue';

const { hoveredSplit, hoveredSplitTooltipPosition } = useRaceHoveredSplit();
const { getSplitElevation, getSplitDuration, getSplitSlopePercent } =
  useGpxMetrics();

const distance = computed(() => {
  return roundOneNumber(
    hoveredSplit.value!.endDistance - hoveredSplit.value!.startDistance
  );
});

const elevation = computed(() => {
  return getSplitElevation(hoveredSplit.value!);
});
</script>
