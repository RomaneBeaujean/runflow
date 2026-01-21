export interface Separator {
  refuel: boolean;
  distance: number;
  stopDuration: number;
  timeBarrier: Date;
}

export class Separator {
  refuel: boolean;
  distance: number;
  stopDuration: number;
  timeBarrier: Date;

  constructor(data?: Partial<Separator>) {
    this.refuel = data.refuel ?? false;
    this.distance = data.distance ?? 0;
    this.stopDuration = data.stopDuration ?? null;
    this.timeBarrier = data.timeBarrier ?? null;
  }
}
