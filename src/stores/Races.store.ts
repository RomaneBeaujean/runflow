// src/stores/RacesStore.ts
import type { Race } from '@/types/Race';
import Dexie from 'dexie';
import { nanoid } from 'nanoid';
import { reactive } from 'vue';

interface State {
  races: Race[];
}

// --- Dexie DB ---
class RacesDB extends Dexie {
  races!: Dexie.Table<Race, string>; // id est string

  constructor() {
    super('runflow-db');
    this.version(1).stores({
      races: 'id,name,trackId,createdAt',
    });
    this.races = this.table('races');
  }
}

const db = new RacesDB();

export class RacesStore {
  protected state = reactive<State>({
    races: [],
  });

  get races(): Race[] {
    return this.state.races;
  }

  async init() {
    this.state.races = await db.races.toArray();
  }

  getRace(id: string | null): Race | null {
    if (!id) return null;
    return this.state.races.find((r) => r.id === id) || null;
  }

  async addRace({ name, trackId }: { name: string; trackId: string }) {
    const race: Race = {
      id: nanoid(),
      name,
      trackId,
      splits: [],
      createdAt: new Date().toISOString(),
    };

    await db.races.add(race);
    await this.init();
  }

  async updateRace(id: string, updated: Partial<Race>) {
    const existing = await db.races.get(id);
    if (!existing) return;

    const newRace = { ...existing, ...updated };
    await db.races.put(newRace);
    await this.init();
  }

  async deleteRace(id: string) {
    await db.races.delete(id);
    await this.init();
  }

  async clearAll() {
    await db.races.clear();
    this.state.races = [];
  }
}
