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
  if (!pace) return null;
  const match = pace?.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

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

/**
 * Convertit un nombre de minutes en une Date avec cette heure.
 * Exemple : 510 → aujourd'hui à 08h30
 */
export const minutesToDate = (minutes: number): Date => {
  const date = new Date(0);
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date;
};

export const dateToFormattedTime = (date: Date): string => {
  if (!date) return '';
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const dateToMinutes = (date: Date | null, start?: Date): number => {
  if (!date) return 0;
  if (start) {
    return Math.round((date.getTime() - start.getTime()) / 60000);
  }
  return date.getHours() * 60 + date.getMinutes();
};

export function parseDate(
  value: string | Date | null | undefined
): Date | null {
  if (!value) return null;
  if (typeof value === 'string') return new Date(value);
  if (value instanceof Date) return value;
  return null;
}

export function dateToFormatted(value: Date) {
  if (!value) return null;
  return value.toLocaleDateString('fr-FR');
}

export function paceToNumber(pace: string) {
  const [min, sec] = pace.split(':').map(Number);
  return min + sec / 60;
}

export function numberToPace(v: number) {
  const minutes = Math.floor(v);
  const seconds = Math.round((v - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
