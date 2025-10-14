<template>
  <VChart
    v-if="race"
    autoresize
    ref="chartComponent"
    style="position: relative; width: 100%; min-height: 300px"
    :option="chartOptions"
    @zr:click="onChartClick"
    @zr:mouseover="onChartHover"
    @zr:globalout="onChartLeave"
  />
  <ClickedPointTooltip />
  <ClickedSeparatorTooltip />
  <HoveredSplitTooltip />
</template>

<script setup lang="ts">
import useRaceChartClick from '@/composables/useChartClick';
import { useEcharts } from '@/composables/useEcharts';
import { useRace } from '@/composables/useRace';
import useRaceChartData from '@/composables/useRaceChartData';
import useRaceHoveredSplit from '@/composables/useRaceHoveredSplit';
import { onMounted, watch } from 'vue';
import VChart from 'vue-echarts';
import ClickedPointTooltip from './ClickedPointTooltip.vue';
import ClickedSeparatorTooltip from './ClickedSeparatorTooltip.vue';
import HoveredSplitTooltip from './HoveredSplitTooltip.vue';

const { hoveredSplit } = useRaceHoveredSplit();
const { race, splits } = useRace();
const { onChartHover, onChartLeave } = useRaceHoveredSplit();
const { onChartClick, closeTooltip, clickedSeparator, clickedPoint } =
  useRaceChartClick();

const { chartComponent } = useEcharts();

const { chartOptions, updateChartSeries } = useRaceChartData();

onMounted(() => {
  updateChartSeries();
});

watch(splits, () => {
  closeTooltip();
  updateChartSeries();
});

watch([clickedSeparator, clickedPoint, hoveredSplit], () => {
  updateChartSeries();
});
</script>

<style lang="scss" scoped>
#chart-wrapper {
  width: 100%;
  height: 100%;
}
</style>
