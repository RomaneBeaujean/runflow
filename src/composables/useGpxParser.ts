import { computeSeparators } from '@/lib/climbPasPro';
import { roundOneNumber } from '@/lib/utils';
import { GpxPoint } from '@/types/GpxPoint';
import { Split } from '@/types/Split';
import GpxParser, { Point } from 'gpxparser';

export function useGpxParser(xml: string) {
  const gpxParser = new GpxParser();
  gpxParser.parse(xml);
  const gpxpoints = extractPoints();
  const gpxexactpoints = exactDistancePoints();
  const gpxtotalDistance = gpxParser.tracks[0].distance.total / 1000;
  const gpxtotalElevation =
    gpxpoints[gpxpoints.length - 1]?.cumulElevation || 0;
  const gpxtotalNegativeElevation =
    gpxpoints[gpxpoints.length - 1]?.cumulNegativeElevation || 0;

  function extractPoints(): GpxPoint[] {
    const distanceCumul = gpxParser.tracks[0]?.distance.cumul;
    let cumulElevation = 0;
    let cumulNegativeElevation = 0;

    return gpxParser.tracks[0].points.map((point: Point, index) => {
      const exactDistance = index === 0 ? 0 : distanceCumul[index] / 1000;

      if (index > 0) {
        const prev = gpxParser.tracks[0].points[index - 1];
        const diff = point.ele - prev.ele;
        if (diff > 0) cumulElevation += diff;
        else cumulNegativeElevation += Math.abs(diff);
      }

      return {
        distance: roundOneNumber(exactDistance),
        elevation: roundOneNumber(point.ele),
        cumulElevation: roundOneNumber(cumulElevation),
        cumulNegativeElevation: roundOneNumber(cumulNegativeElevation),
      };
    });
  }

  function exactDistancePoints(): GpxPoint[] {
    const distanceCumul = gpxParser.tracks[0]?.distance.cumul;
    let cumulElevation = 0;
    let cumulNegativeElevation = 0;

    return gpxParser.tracks[0].points.map((point: Point, index) => {
      const exactDistance = index === 0 ? 0 : distanceCumul[index] / 1000;

      if (index > 0) {
        const prev = gpxParser.tracks[0].points[index - 1];
        const diff = point.ele - prev.ele;
        if (diff > 0) cumulElevation += diff;
        else cumulNegativeElevation += Math.abs(diff);
      }

      return {
        distance: exactDistance,
        elevation: point.ele,
        cumulElevation: cumulElevation,
        cumulNegativeElevation: cumulNegativeElevation,
      };
    });
  }

  function generateSplits(): Split[] {
    const separators = [
      ...computeSeparators(gpxexactpoints, 10, 0.05, 0.5),
      roundOneNumber(gpxtotalDistance),
    ];
    const splits = [];
    separators.forEach((distance: number, index: number) => {
      const startDistance = index === 0 ? 0 : splits[index - 1].endDistance;
      const endDistance = distance;
      const pace = '06:30';
      splits.push({ startDistance, endDistance, pace });
    });

    return splits;
  }

  return {
    gpxpoints,
    gpxexactpoints,
    gpxtotalDistance,
    gpxtotalElevation,
    gpxtotalNegativeElevation,
    generateSplits,
  };
}
