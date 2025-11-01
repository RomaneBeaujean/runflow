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
import ClickedPointTooltip from '@/components/race/chart/ClickedPointTooltip.vue';
import ClickedSeparatorTooltip from '@/components/race/chart/ClickedSeparatorTooltip.vue';
import { useEcharts } from '@/composables/useEcharts';
import { useRace } from '@/composables/useRace';
import useRaceChartClick from '@/composables/useRaceChartClick';
import useRaceChartData from '@/composables/useRaceChartData';
import useRaceChartSplitHover from '@/composables/useRaceChartSplitHover';
import { useViewport } from '@/composables/useViewport';
import { onMounted } from 'vue';
import VChart from 'vue-echarts';

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

<style lang="scss" scoped></style>
