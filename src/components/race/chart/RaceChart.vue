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
</template>

<script setup lang="ts">
import useRaceChartClick from '@/composables/Race/useChartClick';
import { useEcharts } from '@/composables/Race/useEcharts';
import { useRace } from '@/composables/Race/useRace';
import useRaceChartData from '@/composables/Race/useRaceChartData';
import useRaceChartSplitHover from '@/composables/Race/useRaceChartSplitHover';
import { useViewport } from '@/composables/useViewport';
import { onMounted } from 'vue';
import VChart from 'vue-echarts';
import ClickedPointTooltip from './ClickedPointTooltip.vue';
import ClickedSeparatorTooltip from './ClickedSeparatorTooltip.vue';

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
