<template>
  <div
    v-if="position"
    :style="{
      position: 'absolute',
      left: position.left,
      top: '0',
      transform: 'translate(-50%)',
    }"
    :key="hoveredSplit.startDistance"
  >
    <div class="flex flex-col justify-center items-center">
      <div class="flex gap-2 mb-2">
        <Tag style="background-color: #fffbeb; color: #713f12">
          {{ distance }}
          <small>km</small>
          / {{ elevation }}
        </Tag>

        <SlopeTag :percent="slopePercent" icon="pi pi-chart-line" />
      </div>
      <div class="flex gap-2">
        <Tag
          style="background-color: #fce7f3; color: var(--color-violet-800)"
          icon="pi pi-bolt"
          severity="secondary"
        >
          <span>{{ hoveredSplit.pace }} <small>min/km</small></span>
        </Tag>

        <Tag
          style="background-color: #f0fdf4; color: var(--color-emerald-800)"
          icon="pi pi-clock"
          severity="secondary"
        >
          <span>
            {{ duration }}
          </span>
        </Tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEcharts } from '@/composables/useEcharts';
import { useGpxMetrics } from '@/composables/useGpxMetrics';
import useRaceChartSplitHover from '@/composables/useRaceChartSplitHover';
import { minutesToFormattedDuration } from '@/lib/time';
import { roundOneNumber } from '@/lib/utils';
import { Position } from '@/types/Position';
import { Tag } from 'primevue';
import { computed, ref, watch } from 'vue';
import SlopeTag from '../SlopeTag.vue';

const position = ref<Position | null>(null);
const { hoveredSplit } = useRaceChartSplitHover();
const {
  getSplitElevation,
  getSplitDuration,
  getSplitSlopePercent,
  getMidPointFromSplit,
  getSplitNegativeElevation,
} = useGpxMetrics();
const { chartInstance } = useEcharts();

const distance = computed(() => {
  return roundOneNumber(
    hoveredSplit.value!.endDistance - hoveredSplit.value!.startDistance
  );
});

const elevation = computed(() => {
  const positive = getSplitElevation(hoveredSplit.value!);
  const negative = getSplitNegativeElevation(hoveredSplit.value!);
  if (Math.abs(positive) > Math.abs(negative)) {
    return `+${positive} m`;
  }
  return `-${negative}m`;
});

const slopePercent = computed(() => {
  return getSplitSlopePercent(hoveredSplit.value).major;
});

const duration = computed(() => {
  return minutesToFormattedDuration(getSplitDuration(hoveredSplit.value));
});

watch(hoveredSplit, () => {
  if (!hoveredSplit.value) {
    position.value = null;
    return;
  }
  const midPoint = getMidPointFromSplit(hoveredSplit.value);
  const [px, py] = chartInstance.value.convertToPixel(
    { xAxisIndex: 0, yAxisIndex: 0 },
    [midPoint.distance, midPoint.elevation]
  );

  position.value = { left: `${px}px`, top: `${py}px` };
});
</script>
