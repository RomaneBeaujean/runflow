import { useEcharts } from '@/composables/useEcharts';
import { useRace } from '@/composables/useRace';
import useRaceChartInteraction from '@/composables/useRaceChartInteraction';
import { useRaceChartParams } from '@/composables/useRaceChartParams';
import useRaceChartSplitHover from '@/composables/useRaceChartSplitHover';
import { useRaceMetrics } from '@/composables/useRaceMetrics';
import { useViewport } from '@/composables/useViewport';
import { getMarkLineColorStops, getPaceColor } from '@/lib/colors';
import { chunkerizeSegments } from '@/lib/gpx/Segments';
import {
  computeSegmentSlopeKm,
  getAreaSlopeColors,
  getSlopeColors,
} from '@/lib/gpx/SlopeMetrix';
import {
  minutesToFormattedDuration,
  numberToPace,
  paceToNumber,
} from '@/lib/time';
import { roundOneNumber } from '@/lib/utils';
import { GpxSegment } from '@/types/GpxSegment';
import { Split } from '@/types/Split';
import { computed, ref, watch } from 'vue';
const { hoveredSplit } = useRaceChartSplitHover();
const {
  averagePace,
  maxPace,
  minPace,
  getPointsFromSplit,
  getSlopeFromDistance,
  getCumulDurationToDistance,
  getFormattedTimeToDistance,
  getPaceFromDistance,
} = useRaceMetrics();
const { splits, separators, totalDistance, maxElevation } = useRace();
const {
  clickedPoint,
  clickedSeparator,
  dragPaceDistance,
  dragPaceValue,
  dragSeparator,
  dragSeparatorDistance,
} = useRaceChartInteraction();
const { chartInstance } = useEcharts();
const { isMobile } = useViewport();
const {
  showSlopeAreaColor,
  showPointSlope,
  showPointPace,
  showSeparatorDuration,
  showPaceLine,
  showPointDuration,
  showPointTime,
  showSeparator,
  showSeparatorDistance,
} = useRaceChartParams();

const AREA_LINE_COLOR = '#bfbfbf';
const AREA_COLOR = '#DEDEDE';
const AREA_COLOR_EMPHASIS = '#bfbfbf';
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
  // Splits
  // =========================

  const splitsSeries = computed(() => {
    return splits.value.map((split) => {
      const points = getPointsFromSplit(split);
      const serie = {
        id: `serie-${split.startDistance}-${split.endDistance}`,
        type: 'line',
        symbol: 'diamond',
        cursor: 'default',
        animation: false,
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
          areaStyle: showSlopeAreaColor.value
            ? { color: 'white' }
            : { color: AREA_COLOR_EMPHASIS, opacity: 1 },
        },
        // markLine: {
        //   animation: false,
        //   symbol: 'none',
        //   lineStyle: { color: '#024264', type: 'dashed', width: 1 },
        //   label: {
        //     show: true,
        //     position: 'end',
        //     color: '#035581',
        //     fontWeight: 'bold',
        //     fontSize: isMobile.value ? 8 : 11,
        //     backgroundColor: '#B1D5E8',
        //     padding: isMobile.value ? 2 : 4,
        //     rotate: isMobile.value ? 90 : 45,
        //     offset: isMobile.value ? [10, 11] : [20, 10],
        //     borderRadius: 4,
        //     rich: {
        //       xs: { fontSize: 8 },
        //     },
        //     formatter: (params: any) => `${params.value} {xs|km} `,
        //   },
        //   data: separator
        //     ? [
        //         {
        //           xAxis: separator.distance,
        //           label: {
        //             color:
        //               separator.distance === clickedSeparator.value?.distance
        //                 ? CLICKED_SEPARATOR_COLOR
        //                 : separator.refuel
        //                   ? REFUEL_COLOR
        //                   : SEP_COLOR,
        //             backgroundColor:
        //               separator.distance === clickedSeparator.value?.distance
        //                 ? CLICKED_SEPARATOR_BG_COLOR
        //                 : separator.refuel
        //                   ? REFUEL_BG_COLOR
        //                   : SEP_BG_COLOR,
        //           },
        //         },
        //       ]
        //     : [],
        // },
        // markArea: {
        //   zlevel: 1,
        //   silent: true,
        //   symbol: 'none',
        //   label: {
        //     show: true,
        //     rich: {
        //       b: { fontWeight: 'bold' },
        //     },
        //     fontSize: isMobile.value ? 8 : 12,
        //     borderRadius: 4,
        //     padding: 4,
        //   },
        //   data:
        //     separator && showSeparatorDuration.value
        //       ? [
        //           [
        //             {
        //               xAxis: separator.distance,
        //               yAxis: 0,
        //               label: {
        //                 position: 'bottom',
        //                 color: '#054b3a',
        //                 fontWeight: 'bold',
        //                 offset: isMobile.value ? [22, 0] : [-35, 0],
        //                 rotate: isMobile.value ? 90 : 45,
        //                 backgroundColor: '#e7f7f3',
        //                 formatter: () =>
        //                   `${minutesToFormattedDuration(getCumulDurationToDistance(separator.distance))}`,
        //               },
        //             },
        //             {
        //               xAxis: separator.distance,
        //               yAxis: 0,
        //             },
        //           ],
        //         ]
        //       : [],
        // },
      };

      return serie;
    });
  });

  const splitsColoredSeries = computed(() => {
    if (!showSlopeAreaColor.value) return [];
    const segments: GpxSegment[] = splits.value
      .map((split) =>
        computeSegmentSlopeKm(
          chunkerizeSegments(getPointsFromSplit(split), 0.3)
        )
      )
      .flat();

    return segments.map((segment) => {
      const points = segment.points;
      const serie = {
        id: `segment-${segment.startDistance}-${segment.endDistance}`,
        type: 'line',
        cursor: 'default',
        silent: true,
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
  // Séparateurs
  // =========================
  const chartSeparators = computed(() => {
    return separators.value
      .filter((s) => {
        const isRefuel = s.refuel;
        const condition1 = s && s.distance !== totalDistance.value;
        const condition2 = isRefuel || (!isRefuel && showSeparator.value);
        return condition1 && condition2;
      })
      .sort((a, b) => a.distance - b.distance);
  });

  const separatorsSeries = computed(() => {
    const maxYRounded = Math.ceil(maxElevation.value / 100) * 100;
    const step = 50;
    const allPoints = [
      ...Array.from(
        { length: Math.ceil(maxYRounded / step) + 1 },
        (_, i) => i * step
      ),
      maxYRounded,
    ];

    return chartSeparators.value.map((separator) => {
      const isDragged = separator.distance == dragSeparator.value?.distance;
      const isClicked = separator.distance == clickedSeparator.value?.distance;
      const distance = isDragged
        ? dragSeparatorDistance.value
        : separator.distance;

      const serie = {
        id: `separator-${separator.distance}`,
        type: 'line',
        cursor: 'col-resize',
        symbol: 'rect',
        z: 10,
        symbolSize: [10, 30],
        itemStyle: { opacity: 0 },
        lineStyle: { opacity: 0 },
        data: allPoints.map((el) => [distance, el]),
        markLine: {
          animation: false,
          symbol: 'none',
          lineStyle: isClicked
            ? { color: CLICKED_SEPARATOR_BG_COLOR, type: 'dashed', width: 3 }
            : { color: '#024264', type: 'dashed', width: 1 },
          label: {
            show: showSeparatorDistance.value ? true : false,
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
          data: [
            {
              xAxis: distance,
              label: {
                color: isClicked
                  ? CLICKED_SEPARATOR_COLOR
                  : separator.refuel
                    ? REFUEL_COLOR
                    : SEP_COLOR,
                backgroundColor: isClicked
                  ? CLICKED_SEPARATOR_BG_COLOR
                  : separator.refuel
                    ? REFUEL_BG_COLOR
                    : SEP_BG_COLOR,
              },
            },
          ],
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
            ? [
                [
                  {
                    xAxis: distance,
                    yAxis: 0,
                    label: {
                      position: 'bottom',
                      color: '#054b3a',
                      fontWeight: 'bold',
                      offset: isMobile.value ? [22, 0] : [-35, 0],
                      rotate: isMobile.value ? 90 : 45,
                      backgroundColor: '#e7f7f3',
                      formatter: () =>
                        `${minutesToFormattedDuration(getCumulDurationToDistance(distance))}`,
                    },
                  },
                  {
                    xAxis: distance,
                    yAxis: 0,
                  },
                ],
              ]
            : [],
        },
      };
      return serie;
    });
  });

  // =========================
  // Clicked Point
  // =========================

  const clickedPointSerie = computed(() => ({
    id: 'line',
    type: 'line',
    silent: true,
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
        formatter: (params: any) => `${roundOneNumber(params.value)} km`,
      },
      data: clickedPoint.value?.distance
        ? [{ xAxis: roundOneNumber(clickedPoint.value.distance) }]
        : [],
    },
  }));

  // =========================
  // Pace serie
  // =========================

  const isSplitPaceDrag = (split: Split) => {
    const isDragged =
      dragPaceDistance.value &&
      dragPaceDistance.value >= split.startDistance &&
      dragPaceDistance.value <= split.endDistance;
    return isDragged;
  };

  const paceSeries = computed(() => {
    if (!showPaceLine.value) return [];
    return splits.value.map((split, index) => {
      const points = getPointsFromSplit(split);
      const isDragged = isSplitPaceDrag(split);

      const currentPace = isDragged
        ? dragPaceValue.value
        : paceToNumber(split.pace);

      const nextSplit =
        index == splits.value.length - 1 ? null : splits.value[index + 1];

      const nextPace = !nextSplit
        ? currentPace
        : isSplitPaceDrag(nextSplit)
          ? dragPaceValue.value
          : paceToNumber(nextSplit.pace);

      const startPace = Math.max(currentPace, nextPace);
      const endPace = Math.min(currentPace, nextPace);

      const serie = {
        id: `pace-${split.startDistance}-${split.endDistance}`,
        type: 'line',
        cursor: 'row-resize',
        symbolSize: 30,
        symbol: 'rect',
        animation: false,
        itemStyle: {
          opacity: 0,
        },
        data: points.map((p) => [p.distance, currentPace]),
        smooth: false,
        lineStyle: {
          color: getPaceColor(
            currentPace,
            paceToNumber(averagePace.value),
            paceToNumber(minPace.value),
            paceToNumber(maxPace.value)
          ),
          width: 3,
        },
        z: 2,
        showSymbol: false,
        yAxisIndex: 1,
        markLine: {
          yAxisIndex: 1,
          animation: false,
          symbol: 'none',
          silent: true,
          lineStyle: {
            width: 3,
            type: 'solid',
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1, // vertical gradient
              colorStops: getMarkLineColorStops(
                startPace,
                endPace,
                paceToNumber(averagePace.value),
                paceToNumber(minPace.value),
                paceToNumber(maxPace.value)
              ),
            },
          },
          data: [
            [
              { xAxis: split.endDistance, yAxis: currentPace },
              { xAxis: split.endDistance, yAxis: nextPace },
            ],
          ],
        },
        markArea: {
          zlevel: 1,
          silent: true,
          itemStyle: { color: 'transparent' },
          yAxisIndex: 1,
          label: {
            show: true,
            rich: {
              b: { fontWeight: 'bold' },
            },
            fontSize: isMobile.value ? 8 : 12,
            borderRadius: 4,
            padding: 4,
          },
          data: isDragged
            ? [
                [
                  {
                    xAxis: split.startDistance,
                    yAxis: currentPace,
                    label: {
                      padding: 8,
                      fontWeight: 'bold',
                      backgroundColor: '#ffffff',
                      color: getPaceColor(
                        currentPace,
                        paceToNumber(averagePace.value),
                        paceToNumber(minPace.value),
                        paceToNumber(maxPace.value)
                      ),
                      formatter: `${numberToPace(currentPace)}/km`,
                    },
                  },
                  {
                    xAxis: split.endDistance,
                    yAxis: currentPace,
                  },
                ],
              ]
            : [],
        },
      };

      return serie;
    });
  });

  // =========================
  // Chart options
  // =========================

  const grid = computed(() => {
    return {
      top: 40,
      right: 16,
      bottom: isMobile.value ? 0 : 60,
      left: 8,
    };
  });

  const xAxis = computed(() => {
    return {
      type: 'value',
      boundaryGap: false,
      min: 0,
      max: totalDistance ?? 0,
    };
  });

  const yAxis = computed(() => {
    return [
      {
        type: 'value',
        position: 'left',
        show: isMobile.value ? false : true,
        axisLabel: {
          formatter: (v: number) => (v % 100 === 0 ? `${v} m` : ''),
        },
      },
      {
        type: 'value',
        position: 'right',
        show: isMobile.value ? false : true,
        min: Math.max(paceToNumber(minPace.value) - 3, 2.5),
        max: Math.min(paceToNumber(maxPace.value) + 5, 25),
        axisLabel: {
          formatter: (v: number) => {
            const minutes = Math.floor(v);
            const seconds = Math.round((v - minutes) * 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
          },
        },
      },
    ];
  });

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
    grid: grid.value,
    xAxis: xAxis.value,
    yAxis: yAxis.value,
    series: [
      ...splitsSeries.value,
      ...splitsColoredSeries.value,
      ...separatorsSeries.value,
      ...paceSeries.value,
      clickedPointSerie.value,
    ],
  });

  // =========================
  // Hovered Point
  // =========================

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
    if (!chartInstance.value || isMobile.value) return;

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
      grid: grid.value,
      yAxis: yAxis.value,
      series: [
        ...splitsSeries.value,
        ...splitsColoredSeries.value,
        ...separatorsSeries.value,
        ...paceSeries.value,
        clickedPointSerie.value,
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
      showPaceLine,
      dragPaceValue,
      showSeparator,
      showSeparatorDistance,
      dragSeparatorDistance,
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
