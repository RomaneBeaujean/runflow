const PACE_COLORS = [
  '#DC2626', // rouge - très rapide
  '#F87171', // orange foncé
  '#FB923C', // orange clair
  '#10B981', // vert - allure moyenne
  '#60A5FA', // bleu clair
  '#3B82F6', // bleu moyen
  '#1D4ED8', // bleu foncé - très lente
];

export function getPaceColor(
  pace: number,
  paceAvg: number,
  paceMin: number,
  paceMax: number
): string {
  // Vérifie si pace est exactement à l'une des limites
  if (pace <= paceMin) return PACE_COLORS[0]; // rouge
  if (pace >= paceMax) return PACE_COLORS[6]; // bleu foncé

  // Définir les seuils pour les intervalles
  const thresholds = [
    paceMin + (paceAvg - paceMin) / 3, // orange foncé
    paceMin + (2 * (paceAvg - paceMin)) / 3, // orange clair
    paceAvg - 0.5, // vert clair
    paceAvg + 0.5, // vert foncé
    paceAvg + (paceMax - paceAvg) / 3, // bleu clair
    paceAvg + (2 * (paceMax - paceAvg)) / 3, // bleu moyen
  ];

  if (pace < thresholds[0]) return PACE_COLORS[0]; // rouge
  if (pace < thresholds[1]) return PACE_COLORS[1]; // orange foncé
  if (pace < thresholds[2]) return PACE_COLORS[2]; // orange clair
  if (pace <= thresholds[3]) return PACE_COLORS[3]; // vert
  if (pace < thresholds[4]) return PACE_COLORS[4]; // bleu clair
  if (pace < thresholds[5]) return PACE_COLORS[5]; // bleu moyen

  return PACE_COLORS[6]; // bleu foncé
}

export function getMarkLineColorStops(
  startPace: number,
  endPace: number,
  paceAvg: number,
  paceMin: number,
  paceMax: number
) {
  const minPace = Math.min(startPace, endPace);
  const maxPace = Math.max(startPace, endPace);

  const thresholds = [
    { pace: paceMin, color: PACE_COLORS[0] }, // rouge
    { pace: paceMin + (paceAvg - paceMin) / 3, color: PACE_COLORS[1] },
    { pace: paceMin + (2 * (paceAvg - paceMin)) / 3, color: PACE_COLORS[2] },
    { pace: paceAvg - 0.5, color: PACE_COLORS[2] },
    { pace: paceAvg + 0.5, color: PACE_COLORS[3] }, // vert
    { pace: paceAvg + (paceMax - paceAvg) / 3, color: PACE_COLORS[4] },
    { pace: paceAvg + (2 * (paceMax - paceAvg)) / 3, color: PACE_COLORS[5] },
    { pace: paceMax, color: PACE_COLORS[6] }, // bleu foncé
  ];

  const relevant = thresholds.filter(
    (t) => t.pace >= minPace && t.pace <= maxPace
  );

  if (!relevant.find((t) => t.pace === startPace)) {
    relevant.unshift({
      pace: startPace,
      color: getPaceColor(startPace, paceAvg, paceMin, paceMax),
    });
  }
  if (!relevant.find((t) => t.pace === endPace)) {
    relevant.push({
      pace: endPace,
      color: getPaceColor(endPace, paceAvg, paceMin, paceMax),
    });
  }

  const range = maxPace - minPace;
  return relevant.map((t) => ({
    offset: range === 0 ? 0 : 1 - (t.pace - minPace) / range,
    color: t.color,
  }));
}
