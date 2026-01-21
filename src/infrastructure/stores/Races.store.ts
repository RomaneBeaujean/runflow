import { Race } from '@/domain/types/Race';
import { db } from '@/infrastructure/dexie/DexieDatabase';
import { nanoid } from 'nanoid';
import { reactive, toRaw } from 'vue';

export class RacesStore {
  protected state = reactive<Race[]>([]);

  get races(): Race[] {
    return this.state;
  }

  init = async () => {
    const rawRaces = await db.races.toArray();
    this.state = rawRaces.map((r) => new Race(r));
  };

  getById = (id: string | null): Race | null => {
    if (!id) return null;
    return this.state.find((r) => r.id === id) || null;
  };

  create = async (r: Partial<Race>) => {
    const race: Partial<Race> = {
      id: nanoid(),
      name: r.name,
      gpxContent: r.gpxContent,
      splits: r.splits || [],
      separators: r.separators || [],
      date: r.date || null,
      startTime: r.startTime || null,
      createdAt: new Date().toISOString(),
    };

    const cleanRace = JSON.parse(JSON.stringify(toRaw(race)));
    await db.races.add(cleanRace);
    await this.init();
    return race.id;
  };

  updateById = async (id: string, updated: Partial<Race>) => {
    const existing = await db.races.get(id);
    if (!existing) return;

    const newRace = { ...existing, ...updated };
    const cleanRace = JSON.parse(JSON.stringify(toRaw(newRace))); // sérialise tout proprement

    try {
      await db.races.update(id, cleanRace);
      await this.init();
      return newRace;
    } catch (err) {
      console.error('❌ Dexie updateRace error', err, cleanRace);
    }
  };

  deleteById = async (id: string) => {
    await db.races.delete(id);
    await this.init();
  };

  clearAll = async () => {
    await db.races.clear();
    this.state = [];
  };

  import = async (file: any) => {
    const text = await file.text();

    try {
      const raceObj = JSON.parse(text);
      const existing = this.getById(raceObj.id);
      if (!existing) {
        await db.races.put(raceObj);
        await this.init();
        alert('Course importée avec succès !');
      } else {
        alert('Cette course existe déjà.');
      }
    } catch (err) {
      console.error('Erreur import course', err);
      alert('Le fichier est invalide.');
    }
  };
}
