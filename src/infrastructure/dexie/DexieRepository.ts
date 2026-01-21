import { Repository } from '@/domain/types/Repository';
import Dexie from 'dexie';
import { reactive } from 'vue';

export default abstract class DexieRepository<T> implements Repository<T> {
  protected database: Dexie.Table<T>;
  protected state = reactive<T[]>([]);

  constructor(database: Dexie.Table<T>) {
    this.database = database;
  }

  insert(item: T | T[]): T | T[] {
    throw new Error('Method not implemented.');
  }
  findOne(id: string): T {
    throw new Error('Method not implemented.');
  }
  findAll(): T[] {
    throw new Error('Method not implemented.');
  }
  update(id: string, item: T): T {
    throw new Error('Method not implemented.');
  }
  deleteOne(id: string): void {
    throw new Error('Method not implemented.');
  }
  deleteAll(): void {
    throw new Error('Method not implemented.');
  }
}
