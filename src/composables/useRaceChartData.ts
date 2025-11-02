import { useEcharts } from '@/composables/useEcharts';
import { useRace } from '@/composables/useRace';
import useRaceChartClick from '@/composables/useRaceChartClick';
import { useRaceChartParams } from '@/composables/useRaceChartParams';
import useRaceChartSplitHover from '@/composables/useRaceChartSplitHover';
import { useRaceMetrics } from '@/composables/useRaceMetrics';
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

const { hoveredSplit } = useRaceChartSplitHover();
const {
  getPointsFromSplit,
  getSlopeFromDistance,
  getCumulDurationToDistance,
  getFormattedTimeToDistance,
  getPaceFromDistance,
  getClosestPoint,
} = useRaceMetrics();
const { splits, separators, totalDistance } = useRace();
const { clickedPoint, clickedSeparator } = useRaceChartClick();
const { chartInstance, getPositionFromPoint } = useEcharts();
const { isMobile } = useViewport();
const {
  showSlopeAreaColor,
  showPointSlope,
  showPointPace,
  showSeparatorDuration,
  showPointDuration,
  showPointTime,
} = useRaceChartParams();

const AREA_LINE_COLOR = '#155E75';
const AREA_COLOR = '#EFF6FF';
const AREA_COLOR_EMPHASIS = '#b1d5e8';
const AREA_OPACITY = 0.6;
const AREA_OPACITY_EMPHASIS = 0.4;
const CLICKED_SEPARATOR_COLOR = '#F59E1D';
const CLICKED_SEPARATOR_BG_COLOR = '#FEF3C7';
const REFUEL_BG_COLOR = '#F5D0FE';
const REFUEL_COLOR = '#C026D3';
const SEP_COLOR = '#035581';
const SEP_BG_COLOR = '#B1D5E8';

export default function useRaceChartData() {
  // =========================
  // Séparateurs
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
        data: showSeparatorDuration.value
          ? chartSeparators.value.map((sep: Separator) => [
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
            ])
          : [],
      },
    };
  });

  // =========================
  // Splits
  // =========================

  const splitsSeries = computed(() => {
    return splits.value.map((split) => {
      const points = getPointsFromSplit(split);
      const serie = {
        id: `serie-${split.startDistance}-${split.endDistance}`,
        type: 'line',
        symbol: 'diamond',
        data: points.map((p) => [p.distance, p.elevation]),
        smooth: false,
        z: 2,
        showSymbol: false,
        lineStyle: showSlopeAreaColor.value
          ? { color: 'transparent' }
          : { color: AREA_LINE_COLOR, width: 2 },
        areaStyle: showSlopeAreaColor.value
          ? { color: 'white', opacity: AREA_OPACITY }
          : { color: AREA_COLOR, opacity: 1 },
        emphasis: {
          itemStyle: {
            color: '#DB2777',
            borderColor: '#DB2777',
            borderWidth: 0,
          },
          lineStyle: { width: 4 },
          areaStyle: showSlopeAreaColor.value
            ? { color: 'white' }
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
    if (!showSlopeAreaColor.value) return [];
    const segments: GpxSegment[] = splits.value
      .map((split) =>
        ComputeSegmentSlopeKm(
          chunkerizeSegments(getPointsFromSplit(split), 0.3)
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
        emphasis: {
          opacity: 1,
          itemStyle: { color: 'transparent', borderWidth: 0 },
        },
      };

      return serie;
    });
  });

  // =========================
  // Clicked Point
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
      show: true,
      trigger: 'axis',
      renderMode: 'html',
      backgroundColor: 'transparent',
      borderWidth: 0,
      textStyle: {
        color: '#fff',
        fontSize: 12,
      },
      padding: 0,
      position: (point, params, dom, rect, size) => {
        return getPointerTooltipPosition(point, size);
      },
      formatter: (params: any) => {
        return getPointerTooltip(params);
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
      axisLabel: {
        formatter: (v: number) => (v % 100 === 0 ? `${v} m` : ''),
      },
    },
    series: [],
  });

  /**
   * Hovered Point
   */

  const getPointerTooltipPosition = (point: any, size: any) => {
    const [x] = point;
    const [tooltipWidth] = size.contentSize;
    const viewportWidth = window.innerWidth;
    const margin = 10;
    const isOverflowingRight = x + tooltipWidth + margin > viewportWidth;
    const left = isOverflowingRight ? x - tooltipWidth - margin : x + margin;
    const top = 40;
    return [`${left}px`, `${top}px`];
  };

  const getPointerTooltip = (params: any) => {
    const [p] = params;

    // Distance
    const distance = p.value[0];
    const distanceDiv = `<div><b>${distance} km</b></div>`;
    // Slope
    const slope = getSlopeFromDistance(distance);
    const { color } = getSlopeColors(slope);
    const slopeDiv = `<div>Pente: <span style="color: ${color}"><b>${slope}%</b></span></div>`;
    // Pace
    const pace = getPaceFromDistance(distance);
    const paceDiv = `<div>Allure: <b>${pace}/km</b></div>`;

    // Duration
    const duration = minutesToFormattedDuration(
      getCumulDurationToDistance(distance)
    );
    const durationDiv = `<div>Temps écoulé: <b>${duration}</b></div>`;

    // Time
    const time = getFormattedTimeToDistance(distance);
    const timeDiv = `<div>Heure: <b>${time}</b></div>`;

    const fontSize = isMobile.value ? '10px' : '12px';
    const padding = isMobile.value ? '2px' : '4px';
    const lineHeight = isMobile.value ? '12px' : '14px';

    const style = `display: flex; flex-direction: column; opacity: 0.8; background: white; border-radius:4px; color: black; padding: ${padding}; line-height: ${lineHeight} font-size: ${fontSize}`;

    return `<div style='${style}'>
    ${distanceDiv}
    ${showPointSlope.value ? slopeDiv : ''}
    ${showPointPace.value ? paceDiv : ''}
    ${showPointDuration.value ? durationDiv : ''}
     ${showPointTime.value && time ? timeDiv : ''}
    </div>`;
  };

  // =========================
  // Hovered Split
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

  watch(hoveredSplit, (newHovered, previousHovered) => {
    if (!chartInstance.value) return;

    // if (
    //   showSplitDistance.value ||
    //   showSplitElevation.value ||
    //   showSplitPace.value
    // ) {
    //   if (previousHovered) updateMarkArea(previousHovered, []);
    //   if (newHovered) updateMarkArea(newHovered, hoveredSplitMarkAreaData());
    // }

    if (isMobile.value) return;

    // Area Emphasis
    if (showSlopeAreaColor.value) {
      if (previousHovered) updateAreaOpacity(previousHovered, AREA_OPACITY);
      if (newHovered) updateAreaOpacity(newHovered, AREA_OPACITY_EMPHASIS);
    } else {
      if (previousHovered) updateAreaColor(previousHovered, AREA_COLOR);
      if (newHovered) updateAreaColor(newHovered, AREA_COLOR_EMPHASIS);
    }
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

  // =========================
  // Watch sur splits et separators
  // =========================

  watch(
    [
      isMobile,
      splits,
      separators,
      clickedSeparator,
      showPointTime,
      clickedPoint,
      showPointDuration,
      showPointPace,
      showPointSlope,
      showSeparatorDuration,
      showSlopeAreaColor,
    ],
    () => {
      updateChartData();
    }
  );

  return {
    chartOptions,
    updateChartData,
  };
}
