<template>
  <VChart
    v-if="race"
    autoresize
    ref="chartRef"
    :option="chartOptions"
    @zr:click="onChartClick"
    @zr:mousedown="onChartMouseDown"
    @zr:mouseover="onChartHover"
    @zr:mousemove="onChartHover"
    @zr:globalout="onChartLeave"
  />
  <ClickedPointTooltip v-if="!isMobile" />
  <ClickedSeparatorTooltip v-if="!isMobile" />
</template>

<script setup lang="ts">
import { useEcharts } from '@/ui/composables/useEcharts';
import { useRace } from '@/ui/composables/useRace';
import useRaceChartData from '@/ui/composables/useRaceChartData';
import useRaceChartInteraction from '@/ui/composables/useRaceChartInteraction';
import useRaceChartSplitHover from '@/ui/composables/useRaceChartSplitHover';
import { useViewport } from '@/ui/composables/useViewport';
import ClickedPointTooltip from '@/ui/pages/races/race/chart/ClickedPointTooltip.vue';
import ClickedSeparatorTooltip from '@/ui/pages/races/race/chart/ClickedSeparatorTooltip.vue';
import { onMounted } from 'vue';
import VChart from 'vue-echarts';

const { isMobile } = useViewport();
const { onChartHover, onChartLeave } = useRaceChartSplitHover();
const { onChartClick, onChartMouseDown } = useRaceChartInteraction();

const { race } = useRace();
const { chartRef } = useEcharts();
const { chartOptions, updateChartData } = useRaceChartData();

onMounted(() => {
  updateChartData();
});
</script>

<style lang="scss" scoped></style>
