<template>
  <VChart
    v-if="race"
    autoresize
    ref="chartRef"
    style="position: relative"
    :option="chartOptions"
    @zr:click="onChartClick"
    @zr:mouseover="onChartHover"
    @zr:globalout="onChartLeave"
  />
  <ClickedPointTooltip v-if="!isMobile" />
  <ClickedSeparatorTooltip v-if="!isMobile" />
  <HoveredSplitTooltip v-if="!isMobile" />
</template>

<script setup lang="ts">
import useRaceChartClick from '@/composables/useChartClick';
import { useEcharts } from '@/composables/useEcharts';
import { useRace } from '@/composables/useRace';
import useRaceChartData from '@/composables/useRaceChartData';
import useRaceChartSplitHover from '@/composables/useRaceChartSplitHover';
import { useViewport } from '@/composables/useViewport';
import { onMounted } from 'vue';
import VChart from 'vue-echarts';
import ClickedPointTooltip from './ClickedPointTooltip.vue';
import ClickedSeparatorTooltip from './ClickedSeparatorTooltip.vue';
import HoveredSplitTooltip from './HoveredSplitTooltip.vue';

const { isMobile } = useViewport();
const { onChartHover, onChartLeave } = useRaceChartSplitHover();
const { onChartClick } = useRaceChartClick();

const { race } = useRace();
const { chartRef } = useEcharts();
const { chartOptions, updateChartData } = useRaceChartData();

onMounted(() => {
  updateChartData();
});
</script>

<style lang="scss" scoped>
#chart-wrapper {
  width: 100%;
  height: 100%;
}
</style>
