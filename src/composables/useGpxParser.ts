import { roundOneNumber } from '@/lib/utils';
import { GpxPoint } from '@/types/DistanceElevation';
import GpxParser, { Point } from 'gpxparser';

export function useGpxParser(xml: string) {
  const gpxParser = new GpxParser();
  gpxParser.parse(xml);
  const gpxpoints = extractPoints();
  const gpxtotalDistance = gpxParser.tracks[0].distance.total / 1000;

  function extractPoints(): GpxPoint[] {
    const distanceCumul = gpxParser.tracks[0].distance.cumul;
    let cumulElevation = 0;

    return gpxParser.tracks[0].points.map((point: Point, index) => {
      const exactDistance = index === 0 ? 0 : distanceCumul[index] / 1000;

      if (index > 0) {
        const prev = gpxParser.tracks[0].points[index - 1];
        const diff = point.ele - prev.ele;
        if (diff > 0) cumulElevation += diff;
      }

      return {
        distance: roundOneNumber(exactDistance),
        elevation: roundOneNumber(point.ele),
        cumulElevation: roundOneNumber(cumulElevation),
      };
    });
  }

  return { gpxpoints, gpxtotalDistance };
}
