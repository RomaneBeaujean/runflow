export interface Separator {
  refuel: boolean;
  distance: number;
  stopDuration: number;
  timeBarrier: number;
}

export class Separator {
  refuel: boolean;
  distance: number;
  stopDuration: number;
  timeBarrier: number;

  constructor(data?: Partial<Separator>) {
    this.refuel = data.refuel ?? false;
    this.distance = data.distance ?? 0;
    this.stopDuration = data.stopDuration ?? null;
    this.timeBarrier = data.timeBarrier ?? null;
  }
}
