import { roundOneNumber } from '@/lib/utils';
import { Separator } from '@/types/Separator';
import { computed, ref, watch } from 'vue';
import useRaceChartClick from './useChartClick';
import { useGpxMetrics } from './useGpxMetrics';
import { useRace } from './useRace';
import useRaceHoveredSplit from './useRaceHoveredSplit';

const { hoveredSplit } = useRaceHoveredSplit();
const { getPointsFromSplit, getCumulElevationToDistance } = useGpxMetrics();
const { splits, separators, totalDistance } = useRace();
const { clickedPoint, clickedSeparator } = useRaceChartClick();

export default function useRaceChartData() {
  // =========================
  // Séparateurs filtrés
  // =========================
  const chartSeparators = computed(() => {
    return separators.value.filter((s) => s.distance !== totalDistance.value);
  });

  // =========================
  // Séries dynamiques
  // =========================
  const splitsSeries = ref<any[]>([]);
  const separatorsSeries = ref<any>(null);

  const buildSplitsSeries = () => {
    splitsSeries.value = splits.value.map((split) => ({
      id: `serie-${split.startDistance}-${split.endDistance}`,
      type: 'line',
      data: getPointsFromSplit(split).map((p) => [p.distance, p.elevation]),
      smooth: true,
      showSymbol: true,
      symbolSize: 0,
      lineStyle: { color: '#A48B82', width: 2 },
      areaStyle: { color: 'rgba(164,139,130,0.3)' },
      emphasis: { lineStyle: { width: 4 }, areaStyle: { opacity: 0.4 } },
    }));
  };

  const buildSeparatorsSeries = () => {
    separatorsSeries.value = {
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
  };

  // =========================
  // Série du point cliqué
  // =========================
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
    grid: { top: 24, right: 24, bottom: 24, left: 24, containLabel: true },
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
  // Initialisation
  // =========================
  buildSplitsSeries();
  buildSeparatorsSeries();

  // =========================
  // Update du graphique
  // =========================

  const updateChartSeries = () => {
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
    if (previousHovered) {
      const unHoveredSerie = splitsSeries.value.find((s) =>
        s.id.includes(`serie-${previousHovered.startDistance}-`)
      );
      if (unHoveredSerie) {
        unHoveredSerie.lineStyle.color = '#A48B82';
        unHoveredSerie.lineStyle.width = 2;
        unHoveredSerie.areaStyle.color = 'rgba(164,139,130,0.3)';
      }
    }

    // HOVER le nouveau
    if (newHovered) {
      const hoveredSerie = splitsSeries.value.find((s) =>
        s.id.includes(`serie-${newHovered.startDistance}-`)
      );
      if (hoveredSerie) {
        hoveredSerie.lineStyle.color = '#F59E1D';
        hoveredSerie.lineStyle.width = 4;
        hoveredSerie.areaStyle.color = 'rgba(245,158,29,0.3)';
      }
    }

    updateChartSeries();
  });

  // =========================
  // Watch sur splits et separators
  // =========================
  watch(splits, () => {
    buildSplitsSeries();
    updateChartSeries();
  });

  watch(separators, () => {
    buildSeparatorsSeries();
    updateChartSeries();
  });

  watch([clickedSeparator, clickedPoint], () => {
    updateChartSeries();
  });

  return {
    chartOptions,
    updateChartSeries,
  };
}
