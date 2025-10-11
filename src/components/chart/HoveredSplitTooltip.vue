<template>
  <div
    v-if="position && split"
    :style="{
      position: 'absolute',
      left: position.left,
      top: '20px',
      transform: 'translate(-50%,-50%)',
    }"
    :key="split.startDistance"
  >
    <div
      style="
        min-width: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      <swm-tags>
        <swm-tag color="pink">
          <swm-icon slot="left" name="arrows-left-right"></swm-icon>
          <span slot="label">{{ distance }} km</span>
        </swm-tag>
        <swm-tag color="orange">
          <swm-icon slot="left" name="chart-line"></swm-icon>
          <span slot="label">{{ elevation }} d+ </span>
        </swm-tag>
      </swm-tags>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Position } from '@/domain/entities/Position';
import { roundOneNumber } from '@/lib/utils';
import { useGpxMetrics } from '@/composables/useGpxMetrics';
import { Split } from '@runflow/shared';
import { computed } from 'vue';

const props = defineProps<{
  position: Position | null;
  split: Split | null;
}>();
const { getElevationFromSplit } = useGpxMetrics();

const distance = computed(() => {
  return roundOneNumber(props.split.endDistance - props.split.startDistance);
});

const elevation = computed(() => {
  return getElevationFromSplit(props.split);
});
</script>

<style scoped></style>
