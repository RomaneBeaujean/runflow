import { Race } from '@/types/entities/Race';
import Dexie from 'dexie';
import { nanoid } from 'nanoid';
import { reactive, toRaw } from 'vue';

// --- Dexie DB ---
class RacesDB extends Dexie {
  races!: Dexie.Table<Race, string>; // id est string

  constructor() {
    super('runflow-db');
    this.version(2)
      .stores({
        races: 'id,name,createdAt',
      })
      .upgrade(async (tx) => {
        const races = await tx.table('races').toArray();
        for (const r of races) {
          // utilise le constructeur Race pour "compléter" la course avec les valeurs par défaut
          const migratedRace = new Race(r);

          // sauvegarde la course migrée
          await tx.table('races').put(migratedRace);
        }
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

  init = async () => {
    const rawRaces = await db.races.toArray();
    this.state.races = rawRaces.map((r) => new Race(r));
  };

  getRace = (id: string | null): Race | null => {
    if (!id) return null;
    return this.state.races.find((r) => r.id === id) || null;
  };

  addRace = async (r: Partial<Race>) => {
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

  updateRace = async (id: string, updated: Partial<Race>) => {
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

  deleteRace = async (id: string) => {
    await db.races.delete(id);
    await this.init();
  };

  clearAll = async () => {
    await db.races.clear();
    this.state.races = [];
  };

  importRace = async (file: any) => {
    const text = await file.text();

    try {
      const raceObj = JSON.parse(text);
      const existing = this.getRace(raceObj.id);
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
