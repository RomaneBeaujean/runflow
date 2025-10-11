import type { Track } from '@/types/Track';
import Dexie from 'dexie';
import { reactive } from 'vue';

interface State {
  tracks: Track[];
}

class TracksDB extends Dexie {
  tracks!: Dexie.Table<Track, number>;

  constructor() {
    super('runflow-db');
    this.version(1).stores({
      tracks: '++id,name,createdAt',
    });
    this.tracks = this.table('tracks');
  }
}

const db = new TracksDB();

export class TracksStore {
  protected state = reactive<State>({
    tracks: [],
  });

  get tracks(): Track[] {
    return this.state.tracks;
  }

  async init() {
    this.state.tracks = await db.tracks.toArray();
  }

  getTrack(id: string | number | null): Track | null {
    if (!id) return null;
    return this.state.tracks.find((t) => t.id === id) || null;
  }

  async addTrack({ name, content }: { name: string; content: string }) {
    const payload: Track = {
      id: undefined as any, // auto-incrémenté par Dexie
      name,
      gpxContent: content,
      createdAt: new Date().toISOString(),
    };

    await db.tracks.add(payload);
    await this.init();
  }

  async deleteTrack(id: number) {
    await db.tracks.delete(id);
    await this.init();
  }

  async clearAll() {
    await db.tracks.clear();
    this.state.tracks = [];
  }
}
