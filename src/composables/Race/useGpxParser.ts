import { roundOneNumber } from '@/lib/utils';
import { GpxPoint } from '@/types/GpxPoint';
import GpxParser, { Point } from 'gpxparser';

export function useGpxParser(xml: string) {
  const gpxParser = new GpxParser();
  gpxParser.parse(xml);

  const track = gpxParser.tracks[0] || gpxParser.routes[0];
  const points = track?.points || [];
  const gpxpoints = extractPoints();
  const gpxtotalDistance = track?.distance.total / 1000;
  const gpxtotalElevation =
    gpxpoints[gpxpoints.length - 1]?.cumulElevation || 0;
  const gpxtotalNegativeElevation =
    gpxpoints[gpxpoints.length - 1]?.cumulNegativeElevation || 0;

  function extractPoints(): GpxPoint[] {
    const distanceCumul = track.distance.cumul;
    let cumulElevation = 0;
    let cumulNegativeElevation = 0;

    return points.map((point: Point, index) => {
      const exactDistance = index === 0 ? 0 : distanceCumul[index] / 1000;

      if (index > 0) {
        const prev = points[index - 1];
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

  // function exactDistancePoints(): GpxPoint[] {
  //   const distanceCumul = gpxParser.tracks[0]?.distance.cumul;
  //   let cumulElevation = 0;
  //   let cumulNegativeElevation = 0;

  //   return points.map((point: Point, index) => {
  //     const exactDistance = index === 0 ? 0 : distanceCumul[index] / 1000;

  //     if (index > 0) {
  //       const prev = points[index - 1];
  //       const diff = point.ele - prev.ele;
  //       if (diff > 0) cumulElevation += diff;
  //       else cumulNegativeElevation += Math.abs(diff);
  //     }

  //     return {
  //       distance: exactDistance,
  //       elevation: point.ele,
  //       cumulElevation: cumulElevation,
  //       cumulNegativeElevation: cumulNegativeElevation,
  //     };
  //   });
  // }

  return {
    points,
    gpxpoints,
    gpxtotalDistance,
    gpxtotalElevation,
    gpxtotalNegativeElevation,
  };
}
