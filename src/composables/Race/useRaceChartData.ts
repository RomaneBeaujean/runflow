import { useEcharts } from '@/composables/race/useEcharts';
import { useRace } from '@/composables/race/useRace';
import useRaceChartClick from '@/composables/race/useRaceChartClick';
import useRaceChartSplitHover from '@/composables/race/useRaceChartSplitHover';
import { useRaceMetrics } from '@/composables/race/useRaceMetrics';
import { useViewport } from '@/composables/useViewport';
import { chunkerizeSegments } from '@/lib/gpx/Segments';
import {
  ComputeSegmentSlopeKm,
  getAreaSlopeColors,
  getSlopeColors,
} from '@/lib/gpx/SlopeMetrix';
import { minutesToFormattedDuration } from '@/lib/time';
import { roundOneNumber } from '@/lib/utils';
import { Separator } from '@/types/entities/Separator';
import { GpxSegment } from '@/types/GpxSegment';
import { Split } from '@/types/Split';
import { computed, ref, watch } from 'vue';
import { useRaceFilters } from './useRaceFilters';

const { hoveredSplit } = useRaceChartSplitHover();
const {
  getPointsFromSplit,
  getSplitSlopePercent,
  getSplitElevation,
  getSplitNegativeElevation,
  getCumulDurationToDistance,
  getSplitDuration,
} = useRaceMetrics();
const { splits, separators, totalDistance, points } = useRace();
const { clickedPoint, clickedSeparator } = useRaceChartClick();
const { chartInstance } = useEcharts();
const { isMobile } = useViewport();
const { slopeVisual } = useRaceFilters();

export default function useRaceChartData() {
  const AREA_LINE_COLOR = '#155E75';
  const AREA_COLOR = '#EFF6FF';
  const AREA_COLOR_EMPHASIS = '#b1d5e8';
  const CLICKED_SEPARATOR_COLOR = '#F59E1D';
  const CLICKED_SEPARATOR_BG_COLOR = '#FEF3C7';
  const REFUEL_BG_COLOR = '#F5D0FE';
  const REFUEL_COLOR = '#C026D3';
  const SEP_COLOR = '#035581';
  const SEP_BG_COLOR = '#B1D5E8';

  // =========================
  // Séparateurs filtrés
  // =========================
  const chartSeparators = computed(() => {
    return separators.value
      .filter((s) => {
        return s.distance !== totalDistance.value;
      })
      .sort((a, b) => a.distance - b.distance);
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
          color: '#035581',
          fontWeight: 'bold',
          fontSize: isMobile.value ? 8 : 11,
          backgroundColor: '#B1D5E8',
          padding: isMobile.value ? 2 : 4,
          rotate: isMobile.value ? 90 : 45,
          offset: isMobile.value ? [10, 11] : [20, 10],
          borderRadius: 4,
          rich: {
            xs: { fontSize: 8 },
          },
          formatter: (params: any) => `${params.value} {xs|km} `,
        },
        data: chartSeparators.value.map((sep: Separator) => ({
          xAxis: sep.distance,
          label: {
            color:
              sep.distance === clickedSeparator.value?.distance
                ? CLICKED_SEPARATOR_COLOR
                : sep.refuel
                  ? REFUEL_COLOR
                  : SEP_COLOR,
            backgroundColor:
              sep.distance === clickedSeparator.value?.distance
                ? CLICKED_SEPARATOR_BG_COLOR
                : sep.refuel
                  ? REFUEL_BG_COLOR
                  : SEP_BG_COLOR,
          },
          lineStyle: {
            color:
              sep.distance === clickedSeparator.value?.distance
                ? CLICKED_SEPARATOR_COLOR
                : sep.refuel
                  ? REFUEL_COLOR
                  : SEP_COLOR,
            width: sep.distance === clickedSeparator.value?.distance ? 3 : 1,
          },
        })),
      },
      markArea: {
        zlevel: 1,
        silent: true,
        itemStyle: { color: 'transparent' },
        label: {
          show: true,
          rich: {
            b: { fontWeight: 'bold' },
          },
          fontSize: isMobile.value ? 8 : 12,
          borderRadius: 4,
          padding: 4,
        },
        data: chartSeparators.value.map((sep: Separator) => [
          {
            xAxis: sep.distance,
            yAxis: 0,
            label: {
              position: 'bottom',
              color: '#054b3a',
              fontWeight: 'bold',
              offset: isMobile.value ? [22, 0] : [-35, 0],
              rotate: isMobile.value ? 90 : 45,
              backgroundColor: '#e7f7f3',
              formatter: () =>
                `${minutesToFormattedDuration(getCumulDurationToDistance(sep.distance))}`,
            },
          },
          {
            xAxis: sep.distance,
            yAxis: 0,
          },
        ]),
      },
    };
  });

  const splitsSeries = computed(() => {
    return splits.value.map((split) => {
      const points = getPointsFromSplit(split);
      const serie = {
        id: `serie-${split.startDistance}-${split.endDistance}`,
        type: 'line',
        data: points.map((p) => [p.distance, p.elevation]),
        smooth: false,
        z: 2,
        showSymbol: false,
        lineStyle: slopeVisual.value
          ? { color: 'transparent' }
          : { color: AREA_LINE_COLOR, width: 2 },
        areaStyle: slopeVisual.value
          ? { color: 'white', opacity: 0.5 }
          : { color: AREA_COLOR, opacity: 1 },
        emphasis: {
          lineStyle: { width: 4 },
          areaStyle: slopeVisual.value
            ? { color: 'white', opacity: 0.1 }
            : { color: AREA_COLOR_EMPHASIS, opacity: 1 },
        },
        markArea: {
          zlevel: 1,
          silent: true,
          itemStyle: { color: 'transparent' },
          label: {
            show: true,
            rich: {
              b: { fontWeight: 'bold' },
            },
            lineHeight: isMobile.value ? 10 : 14,
            fontSize: isMobile.value ? 8 : 12,
            borderRadius: 4,
            padding: 4,
          },
          data: [],
        },
      };

      return serie;
    });
  });

  const splitsColoredSeries = computed(() => {
    if (!slopeVisual.value) return [];
    const segments: GpxSegment[] = splits.value
      .map((split) =>
        ComputeSegmentSlopeKm(
          chunkerizeSegments(getPointsFromSplit(split), 0.6)
        )
      )
      .flat();

    return segments.map((segment) => {
      const points = segment.points;
      const serie = {
        id: `segment-${segment.startDistance}-${segment.endDistance}`,
        type: 'line',
        z: 1,
        data: points.map((p) => [p.distance, p.elevation]),
        smooth: false,
        showSymbol: false,
        lineStyle: { width: 2, color: getAreaSlopeColors(segment.slope) },
        areaStyle: { opacity: 1, color: getAreaSlopeColors(segment.slope) },
        emphasis: { opacity: 1 },
      };

      return serie;
    });
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
        show: !isMobile.value,
        position: 'end',
        fontWeight: 'bold',
        color: '#6b5511',
        fontSize: 11,
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
            const distance = roundOneNumber(params.value);
            return `${distance} km`;
          },
        },
      },
    },
    grid: {
      top: 40,
      right: 16,
      bottom: isMobile.value ? 0 : 60,
      left: 8,
    },
    xAxis: {
      type: 'value',
      boundaryGap: false,
      min: 0,
      max: totalDistance ?? 0,
    },
    yAxis: {
      type: 'value',
      show: true,
      axisLabel: { formatter: (v: number) => (v % 100 === 0 ? `${v} m` : '') },
    },
    series: [],
  });

  // =========================
  // Update du graphique
  // =========================

  const updateChartData = () => {
    const options = {
      ...chartOptions.value,
      series: [
        ...splitsSeries.value,
        separatorsSeries.value,
        lineSerie.value,
        ...splitsColoredSeries.value,
      ],
    };

    chartOptions.value = options;

    if (chartInstance.value) {
      chartInstance.value.setOption(options, true); // notMerge = true
    }
  };

  const hoveredSplitMarkAreaData = () => {
    const split = hoveredSplit.value;
    if (!split) return [];

    const positive = getSplitElevation(split);
    const negative = getSplitNegativeElevation(split);
    const elevation =
      Math.abs(positive) > Math.abs(negative)
        ? `+${positive} m`
        : `-${negative} m`;

    const { color, background } = getSlopeColors(
      getSplitSlopePercent(split).major
    );

    const maxY = Math.max(
      ...getPointsFromSplit(split).map((el) => el.elevation)
    );

    const splitDuration = minutesToFormattedDuration(getSplitDuration(split));

    return [
      // Pace / durée du split
      [
        {
          xAxis: split.startDistance,
          label: {
            position: 'insideTop',
            color: '#61325c',
            rotate: 0,
            backgroundColor: '#F4F0F8BF',
            formatter: () =>
              `Allure: {b|${split.pace} min/km} \n {b|(${splitDuration})}`,
          },
        },
        {
          xAxis: split.endDistance,
        },
      ],
      // Distance du split
      [
        {
          xAxis: split.startDistance,
          label: {
            position: 'top',
            color: '#0C4A6E',
            rotate: 0,
            backgroundColor: '#E0F2FE',
            formatter: () =>
              `{b|${roundOneNumber(split.endDistance - split.startDistance)} km}`,
          },
        },
        {
          xAxis: split.endDistance,
        },
      ],
      // Dénivelé du split
      [
        {
          xAxis: split.startDistance,
          yAxis: 0,
          label: {
            position: 'inside',
            color,
            rotate: 0,
            backgroundColor: `${background}BF`,
            formatter: () =>
              `{b|${elevation}}\n(${getSplitSlopePercent(split).major}%)`,
          },
        },
        {
          xAxis: split.endDistance,
          yAxis: maxY,
        },
      ],
    ];
  };

  // =========================
  // Hover dynamique
  // =========================

  const updateAreaColor = (split: Split, areaColor: string) => {
    const serieIndex = splitsSeries.value.findIndex((s) =>
      s.id.includes(`serie-${split.startDistance}-`)
    );
    if (serieIndex === -1) return;

    chartInstance.value.setOption({
      series: [
        {
          id: splitsSeries.value[serieIndex].id,
          areaStyle: { color: areaColor },
        },
      ],
    });
  };

  const updateAreaOpacity = (split: Split, opacity: number) => {
    const serieIndex = splitsSeries.value.findIndex((s) =>
      s.id.includes(`serie-${split.startDistance}-`)
    );
    if (serieIndex === -1) return;

    chartInstance.value.setOption({
      series: [
        {
          id: splitsSeries.value[serieIndex].id,
          areaStyle: { opacity },
        },
      ],
    });
  };

  const updateMarkArea = (split: Split, data: any[]) => {
    const serieIndex = splitsSeries.value.findIndex((s) =>
      s.id.includes(`serie-${split.startDistance}-`)
    );

    if (serieIndex === -1) return;
    chartInstance.value.setOption({
      series: [
        {
          id: splitsSeries.value[serieIndex].id,
          markArea: {
            data: data,
          },
        },
      ],
    });
  };

  watch(hoveredSplit, (newHovered, previousHovered) => {
    if (!chartInstance.value) return;
    if (previousHovered) {
      if (slopeVisual.value) {
        updateAreaOpacity(previousHovered, 0.5);
      } else {
        updateAreaColor(previousHovered, AREA_COLOR);
      }
      updateMarkArea(previousHovered, []);
    }

    if (newHovered) {
      if (slopeVisual.value) {
        updateAreaOpacity(newHovered, 0.1);
      } else {
        updateAreaColor(newHovered, AREA_COLOR_EMPHASIS);
      }
      updateMarkArea(newHovered, hoveredSplitMarkAreaData());
    }
  });

  // =========================
  // Watch sur splits et separators
  // =========================

  watch(
    [slopeVisual, isMobile, splits, separators, clickedSeparator, clickedPoint],
    () => {
      updateChartData();
    }
  );

  return {
    chartOptions,
    updateChartData,
  };
}
