<template>
  <VChart
    v-if="race"
    autoresize
    ref="chartComponent"
    style="position: relative; width: 100%; min-height: 300px"
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

  <HoveredSplitTooltip />
</template>

<script setup lang="ts">
import { useEcharts } from '@/composables/useEcharts';
import { useRace } from '@/composables/useRace';
import useRaceChartData from '@/composables/useRaceChartData';
import useRaceChartInteraction from '@/composables/useRaceChartInteraction';
import useRaceHoveredSplit from '@/composables/useRaceHoveredSplit';
import { GpxPoint } from '@/types/GpxPoint';
import { Position } from '@/types/Position';
import { Separator } from '@/types/Separator';
import { onMounted, ref, watch } from 'vue';
import VChart from 'vue-echarts';
import ClickedPointTooltip from './ClickedPointTooltip.vue';
import ClickedSeparatorTooltip from './ClickedSeparatorTooltip.vue';
import HoveredSplitTooltip from './HoveredSplitTooltip.vue';

const clickedPoint = ref<GpxPoint | null>(null);
const clickTooltipPosition = ref<Position | null>(null);
const clickedSeparator = ref<Separator | null>(null);
const clickedSeparatorPosition = ref<Position | null>(null);
const { hoveredSplit } = useRaceHoveredSplit();
const { race, splits, addSeparator, deleteSeparator } = useRace();

const { onChartHover, onChartClick, onChartLeave, closeTooltip } =
  useRaceChartInteraction({
    clickedPoint,
    clickedSeparatorPosition,
    clickTooltipPosition,
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

<style lang="scss" scoped>
#chart-wrapper {
  width: 100%;
  height: 100%;
}
</style>
