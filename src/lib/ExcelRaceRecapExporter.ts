import { RecapParams } from '@/components/race/recap/RaceRecapTable.vue';
import useRaceSplits from '@/composables/race/useRaceSplits';
import { dateToFormattedTime } from '@/lib/time';
import * as XLSX from 'xlsx';

const { splitItems } = useRaceSplits();

export class ExcelRaceRecapExporter {
  private params: RecapParams;

  constructor(params: RecapParams) {
    this.params = params;
  }

  public exportExcel(filename = 'recap.xlsx') {
    if (!splitItems.value.length) return;

    const rows: any[] = [];

    // Header
    const headers = ['Split', 'Distance'];
    if (this.params.cumulElevation) headers.push('D+ total');
    if (this.params.cumulNegativeElevation) headers.push('D- total');
    headers.push('Longueur split');
    if (this.params.splitElevation) headers.push('D+ split');
    if (this.params.splitNegativeElevation) headers.push('D- split');
    if (this.params.splitSlope) headers.push('Pente split');
    if (this.params.splitPace) headers.push('Allure split');
    if (this.params.splitDuration) headers.push('Durée split');
    if (this.params.refuel) headers.push('Ravitaillement');
    if (this.params.stopRefuelDuration) headers.push("Temps d'arrêt");
    if (this.params.time) headers.push('Heure');
    if (this.params.totalDuration) headers.push('Temps écoulé');
    if (this.params.timeBarrierTime) headers.push('Barrière horaire (heure)');
    if (this.params.timeBarrierDuration)
      headers.push('Barrière horaire (temps écoulé)');

    rows.push(headers);

    // Data
    splitItems.value.forEach((split, idx) => {
      const row: any[] = [];
      row.push(idx === 0 ? 'Départ' : split.index);
      row.push(split.distance);
      if (this.params.cumulElevation) row.push(split.cumulElevation || '');
      if (this.params.cumulNegativeElevation)
        row.push(split.cumulNegativeElevation || '');
      row.push(split.splitDistance || '');
      if (this.params.splitElevation) row.push(split.splitElevation || '');
      if (this.params.splitNegativeElevation)
        row.push(split.splitNegativeElevation || '');
      if (this.params.splitSlope) row.push(split.splitSlopePercent || '');
      if (this.params.splitPace) row.push(split.splitPace || '');
      if (this.params.splitDuration) row.push(split.splitDuration || '');
      if (this.params.refuel) row.push(split.refuel ? 'Oui' : '');
      if (this.params.stopRefuelDuration) row.push(split.stopDuration || '');
      if (this.params.time)
        row.push(split.time ? dateToFormattedTime(split.time) : '');
      if (this.params.totalDuration) row.push(split.cumulDuration || '');
      if (this.params.timeBarrierTime)
        row.push(
          split.timeBarrier ? dateToFormattedTime(split.timeBarrier) : ''
        );
      if (this.params.timeBarrierDuration)
        row.push(split.timeBarrierDuration || '');
      rows.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Récap');
    XLSX.writeFile(workbook, filename);
  }
}
