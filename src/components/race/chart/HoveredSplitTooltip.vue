<template>
  <div
    v-if="position"
    :style="{
      position: 'absolute',
      left: position.left,
      top: '24px',
      transform: 'translate(-50%)',
    }"
    :key="hoveredSplit.startDistance"
  >
    <div class="flex flex-col justify-center items-center">
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
import { useEcharts } from '@/composables/Race/useEcharts';
import useRaceChartSplitHover from '@/composables/Race/useRaceChartSplitHover';
import { useRaceMetrics } from '@/composables/Race/useRaceMetrics';
import { minutesToFormattedDuration } from '@/lib/time';
import { Position } from '@/types/Position';
import { Tag } from 'primevue';
import { computed, ref, watch } from 'vue';

const position = ref<Position | null>(null);
const { hoveredSplit } = useRaceChartSplitHover();
const { getSplitDuration, getMidPointFromSplit } = useRaceMetrics();
const { chartInstance } = useEcharts();

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
