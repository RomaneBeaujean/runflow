import { roundOneNumber } from '@/lib/utils';
import { computed, ref } from 'vue';
import { useGpxMetrics } from './useGpxMetrics';
import { useRace } from './useRace';

const { getPointsFromSplit, getCumulElevationFromDistance } = useGpxMetrics();
const { points, splits, separators, totalDistance } = useRace();

export default function useRaceChartData({ clickedSeparator, clickedPoint }) {
  const series = computed(() => {
    if (splits.value?.length < 1) {
      const data = points.value.map((p) => [p.distance, p.elevation]);
      return [
        {
          id: `serie-0-${totalDistance}`,
          type: 'line',
          data,
          smooth: true,
          showSymbol: true,
          symbolSize: 0,
          lineStyle: { color: '#A48B82', width: 2 },
          areaStyle: { color: 'rgba(164, 139, 130, 0.3)' },
          emphasis: { areaStyle: { color: '#B39E96' } },
        },
      ];
    }
    return splits.value.map((split) => {
      const data = getPointsFromSplit(split).map((p) => [
        p.distance,
        p.elevation,
      ]);
      return {
        id: `serie-${split.startDistance}-${split.endDistance}`,
        type: 'line',
        data,
        smooth: true,
        showSymbol: true,
        symbolSize: 0,
        lineStyle: { color: '#A48B82', width: 2 },
        areaStyle: { color: 'rgba(164, 139, 130, 0.3)' },
        emphasis: { areaStyle: { color: '#B39E96' } },
      };
    });
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
        data: separators.value.map((distance) => {
          return {
            xAxis: distance,
            lineStyle: {
              color:
                distance === clickedSeparator.value ? '#B63C47' : '#035581',
              width: distance === clickedSeparator.value ? 3 : 1,
            },
          };
        }),
      },
    };
  });

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
            const denivTotal = getCumulElevationFromDistance(distance) || 0;
            return `${distance} km - ${denivTotal}m d+`;
          },
        },
      },
    },
    xAxis: {
      type: 'value',
      boundaryGap: false,
      min: 0,
      max: totalDistance ?? 0,
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => (value % 100 === 0 ? `${value} m` : ''),
      },
    },
    series: [],
  });

  const lineSerie = computed(() => {
    return {
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
    };
  });

  const updateChartSeries = () => {
    chartOptions.value.series = [
      ...series.value,
      separatorsSeries.value,
      lineSerie.value,
    ];
  };

  return {
    chartOptions,
    updateChartSeries,
  };
}
