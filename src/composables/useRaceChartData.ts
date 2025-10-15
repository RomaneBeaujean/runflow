import { roundOneNumber } from '@/lib/utils';
import { Separator } from '@/types/Separator';
import { Split } from '@/types/Split';
import { computed, ref, watch } from 'vue';
import useRaceChartClick from './useChartClick';
import { useEcharts } from './useEcharts';
import { useGpxMetrics } from './useGpxMetrics';
import { useRace } from './useRace';
import useRaceChartSplitHover from './useRaceChartSplitHover';

const { hoveredSplit } = useRaceChartSplitHover();
const { getPointsFromSplit, getCumulElevationToDistance } = useGpxMetrics();
const { splits, separators, totalDistance } = useRace();
const { clickedPoint, clickedSeparator } = useRaceChartClick();
const { chartInstance } = useEcharts();

export default function useRaceChartData() {
  const AREA_LINE_COLOR = '#155E75';
  const AREA_COLOR = '#EFF6FF';
  const AREA_EMPHASIS_COLOR = '#b1d5e8';

  // =========================
  // Séparateurs filtrés
  // =========================
  const chartSeparators = computed(() => {
    return separators.value.filter((s) => s.distance !== totalDistance.value);
  });

  const separatorsSeries = computed(() => {
    return {
      id: 'separators',
      type: 'line',
      data: [],
      markLine: {
        animation: false,
        symbol: 'none',
        lineStyle: { color: '#024264', type: 'dashed', width: 1 },
        label: {
          show: true,
          position: 'end',
          fontWeight: 'bold',
          color: '#035581',
          fontSize: 10,
          backgroundColor: '#B1D5E8',
          padding: 4,
          borderRadius: 4,
          formatter: (params: any) => `${params.value}`,
        },
        data: chartSeparators.value.map((sep: Separator) => ({
          xAxis: sep.distance,
          label: {
            color:
              sep.distance === clickedSeparator.value?.distance
                ? '#F59E1D'
                : sep.refuel
                  ? '#C026D3'
                  : '#035581',
            backgroundColor:
              sep.distance === clickedSeparator.value?.distance
                ? '#FEF3C7'
                : sep.refuel
                  ? '#F5D0FE'
                  : '#B1D5E8',
          },
          lineStyle: {
            color:
              sep.distance === clickedSeparator.value?.distance
                ? '#F59E1D'
                : sep.refuel
                  ? '#C026D3'
                  : '#035581',
            width: sep.distance === clickedSeparator.value?.distance ? 3 : 1,
          },
        })),
      },
    };
  });

  const splitsSeries = computed(() => {
    return splits.value.map((split) => ({
      id: `serie-${split.startDistance}-${split.endDistance}`,
      type: 'line',
      data: getPointsFromSplit(split).map((p) => [p.distance, p.elevation]),
      smooth: true,
      showSymbol: true,
      symbolSize: 0,
      lineStyle: { color: AREA_LINE_COLOR, width: 2 },
      areaStyle: { color: AREA_COLOR, opacity: 1 },
      emphasis: {
        lineStyle: { width: 4 },
        areaStyle: { color: AREA_EMPHASIS_COLOR, opacity: 1 },
      },
    }));
  });

  const lineSerie = computed(() => ({
    id: 'line',
    type: 'line',
    data: [],
    markLine: {
      animation: false,
      symbol: 'none',
      lineStyle: { color: '#b6af72ff', type: 'dashed', width: 1 },
      label: {
        show: true,
        position: 'end',
        fontWeight: 'bold',
        color: '#6b5511',
        fontSize: 10,
        backgroundColor: '#ffe79c',
        padding: 4,
        borderRadius: 4,
        formatter: (params: any) => `${roundOneNumber(params.value)}`,
      },
      data: clickedPoint.value?.distance
        ? [{ xAxis: roundOneNumber(clickedPoint.value.distance) }]
        : [],
    },
  }));

  // =========================
  // Chart options
  // =========================

  const chartOptions = ref({
    tooltip: {
      trigger: 'axis',
      showContent: false,
      axisPointer: {
        type: 'line',
        snap: true,
        label: {
          show: true,
          backgroundColor: '#035581',
          color: '#fff',
          formatter: (params: any) => {
            const distance = params.value;
            const denivTotal = getCumulElevationToDistance(distance) || 0;
            return `${distance} km - ${denivTotal}m d+`;
          },
        },
      },
    },
    grid: { top: 100, right: 80, bottom: 50, left: 70 },
    xAxis: {
      type: 'value',
      boundaryGap: false,
      min: 0,
      max: totalDistance ?? 0,
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => (v % 100 === 0 ? `${v} m` : '') },
    },
    series: [],
  });

  // =========================
  // Update du graphique
  // =========================

  const updateChartData = () => {
    chartOptions.value.series = [
      ...splitsSeries.value,
      separatorsSeries.value,
      lineSerie.value,
    ];
  };

  // =========================
  // Hover dynamique
  // =========================
  watch(hoveredSplit, (newHovered, previousHovered) => {
    if (!chartInstance.value) return;

    const updateSerieStyle = (
      split: Split,
      width: number,
      areaColor: string
    ) => {
      const serieIndex = splitsSeries.value.findIndex((s) =>
        s.id.includes(`serie-${split.startDistance}-`)
      );
      if (serieIndex === -1) return;

      chartInstance.value.setOption({
        series: [
          {
            id: splitsSeries.value[serieIndex].id,
            lineStyle: { width },
            areaStyle: { color: areaColor },
          },
        ],
      });
    };

    if (previousHovered) {
      updateSerieStyle(previousHovered, 2, AREA_COLOR);
    }

    if (newHovered) {
      updateSerieStyle(newHovered, 4, AREA_EMPHASIS_COLOR);
    }
  });

  // =========================
  // Watch sur splits et separators
  // =========================

  watch([splits, separators, clickedSeparator, clickedPoint], () => {
    updateChartData();
  });

  return {
    chartOptions,
    updateChartData,
  };
}
