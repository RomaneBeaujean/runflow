import { Race } from '@/domain/types/Race';
import { TrainingPlan } from '@/domain/types/TrainingPlan';
import Dexie from 'dexie';

class RunflowDB extends Dexie {
  races!: Dexie.Table<Race, string>;
  training_plans!: Dexie.Table<TrainingPlan, string>;

  constructor() {
    super('runflow-db');

    this.version(1).stores({
      races: 'id, createdAt',
    });

    this.version(2)
      .stores({
        races: 'id, createdAt',
      })
      .upgrade(async (tx) => {
        const races = await tx.table('races').toArray();
        for (const r of races) {
          const migratedRace = new Race(r);
          await tx.table('races').put(migratedRace);
        }
      });

    this.version(3).stores({
      races: 'id, createdAt',
      training_plans: 'id, createdAt',
    });

    this.races = this.table('races');
    this.training_plans = this.table('training_plans');
  }
}

export const db = new RunflowDB();
