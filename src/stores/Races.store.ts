import { Race } from '@/types/entities/Race';
import Dexie from 'dexie';
import { nanoid } from 'nanoid';
import { reactive, toRaw } from 'vue';

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
  protected state = reactive<{ races: Race[] }>({
    races: [],
  });

  get races(): Race[] {
    return this.state.races;
  }

  async init() {
    const rawRaces = await db.races.toArray();
    this.state.races = rawRaces.map((r) => new Race(r));
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
      separators: [],
      createdAt: new Date().toISOString(),
    };

    const cleanRace = JSON.parse(JSON.stringify(toRaw(race)));
    await db.races.add(cleanRace);
    await this.init();
  }

  async updateRace(id: string, updated: Partial<Race>) {
    const existing = await db.races.get(id);
    if (!existing) return;

    const newRace = { ...existing, ...updated };
    const cleanRace = JSON.parse(JSON.stringify(toRaw(newRace)));

    try {
      await db.races.put(cleanRace);
      await this.init();
    } catch (err) {
      console.error('❌ Dexie updateRace error', err, cleanRace);
    }
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
