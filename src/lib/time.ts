/**
 * Convertit un pace "mm:ss" et une distance (km) en durée totale (minutes décimales)
 * @param pace - format "mm:ss"
 * @param distance - distance en km (peut être décimal, ex: 12.5)
 * @returns durée totale en minutes (décimales)
 */
export function durationFromPaceAndDistance(
  pace: string,
  distance: number
): number {
  const match = pace.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;

  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);

  const paceMinutes = minutes + seconds / 60;
  const totalMinutes = paceMinutes * distance;

  return totalMinutes;
}

/**
 * Convertit une durée en minutes décimales en string "hh:mm"
 * @param durationMinutes - durée en minutes (décimales)
 * @returns string format "hh:mm"
 */
export function minutesToFormattedDuration(durationMinutes: number): string {
  const totalMinutes = Math.round(durationMinutes); // arrondi à l'entier
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');

  return `${hh}h${mm}`;
}

/**
 * Calcule le pace (mm:ss) à partir d'une durée "hh:mm" et d'une distance
 * @param duration - string "hh:mm"
 * @param distance - distance en km
 * @returns string pace "mm:ss"
 */
export function paceFromFormattedDurationAndDistance(
  duration: string,
  distance: number
): string {
  if (!duration || distance <= 0) return '00:00';
  const totalMinutes = formattedDurationToMinutes(duration);
  const paceDecimal = totalMinutes / distance;

  const m = Math.floor(paceDecimal);
  const s = Math.round((paceDecimal - m) * 60);

  const mFinal = s === 60 ? m + 1 : m;
  const sFinal = s === 60 ? 0 : s;

  const mm = mFinal.toString().padStart(2, '0');
  const ss = sFinal.toString().padStart(2, '0');

  return `${mm}:${ss}`;
}

/**
 * Calcule le pace (mm:ss) à partir d'une durée "hh:mm" et d'une distance
 * @param duration - string "hh:mm"
 * @param distance - distance en km
 * @returns string pace "mm:ss"
 */
export function paceFromMinutesAndDistance(
  totalMinutes: number,
  distance: number
): string {
  if (!totalMinutes || distance <= 0) return '00:00';
  const paceDecimal = totalMinutes / distance;

  const m = Math.floor(paceDecimal);
  const s = Math.round((paceDecimal - m) * 60);

  const mFinal = s === 60 ? m + 1 : m;
  const sFinal = s === 60 ? 0 : s;

  const mm = mFinal.toString().padStart(2, '0');
  const ss = sFinal.toString().padStart(2, '0');

  return `${mm}:${ss}`;
}

/**
 * Convertit une durée format "hh:mm" en minutes décimales
 * @param duration - string "hh:mm"
 * @returns minutes décimales
 */
export function formattedDurationToMinutes(duration: string): number {
  if (!duration) return 0;

  const [hStr, mStr] = duration.split('h');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;

  return h * 60 + m;
}
