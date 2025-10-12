<template>
  <div style="position: relative">
    <VChart
      v-if="race"
      autoresize
      ref="chartComponent"
      style="width: 100%; height: 400px; position: relative"
      :option="chartOptions"
      @zr:click="(e) => onChartClick(e, chartInstance)"
      @zr:mouseover="(e) => onChartHover(e, chartInstance)"
      @zr:globalout="onChartLeave"
    />

    <ClickedPointTooltip
      :position="clickTooltipPosition"
      :addSeparator="addSeparatorOnClickedPoint"
      :closeTooltip="closeTooltip"
    />

    <ClickedSeparatorTooltip
      :position="clickedSeparatorPosition"
      :delete="() => deleteSeparator(clickedSeparator.distance)"
    />

    <HoveredSegmentTooltip
      :position="hoveredSplitTooltipPosition"
      :split="hoveredSplit"
    />
  </div>
</template>

<script setup lang="ts">
import { useEcharts } from '@/composables/useEcharts';
import { useRace } from '@/composables/useRace';
import useRaceChartData from '@/composables/useRaceChartData';
import useRaceChartInteraction from '@/composables/useRaceChartInteraction';
import { GpxPoint } from '@/types/DistanceElevation';
import { Position } from '@/types/Position';
import { Separator } from '@/types/Separator';
import { Split } from '@/types/Split';
import { onMounted, ref, watch } from 'vue';
import VChart from 'vue-echarts';
import ClickedPointTooltip from './ClickedPointTooltip.vue';
import ClickedSeparatorTooltip from './ClickedSeparatorTooltip.vue';
import HoveredSegmentTooltip from './HoveredSplitTooltip.vue';

const hoveredSplit = ref<Split | null>(null);
const hoveredSplitTooltipPosition = ref<Position | null>(null);
const clickedPoint = ref<GpxPoint | null>(null);
const clickTooltipPosition = ref<Position | null>(null);
const clickedSeparator = ref<Separator | null>(null);
const clickedSeparatorPosition = ref<Position | null>(null);

const { race, splits, addSeparator, deleteSeparator } = useRace();

const { onChartHover, onChartClick, onChartLeave, closeTooltip } =
  useRaceChartInteraction({
    clickedPoint,
    clickedSeparatorPosition,
    hoveredSplitTooltipPosition,
    clickTooltipPosition,
    hoveredSplit,
    clickedSeparator,
  });

const { chartComponent, chartInstance } = useEcharts();

const { chartOptions, updateChartSeries } = useRaceChartData({
  clickedSeparator,
  clickedPoint,
});

const addSeparatorOnClickedPoint = (refuel: boolean) => {
  const separator: Separator = {
    distance: clickedPoint.value.distance,
    refuel,
    stopDuration: null,
    timeBarrier: null,
  };
  addSeparator(separator);
  closeTooltip();
};

onMounted(() => {
  updateChartSeries();
});

watch(splits, () => {
  closeTooltip();
  updateChartSeries();
});

watch(clickedSeparator, () => {
  updateChartSeries();
});

watch(clickedPoint, () => {
  updateChartSeries();
});
</script>

<style lang="scss" scoped></style>
