export interface Repository<T> {
  insert(item: T | T[]): T | T[] | null;
  findOne(id: string): T | null;
  findAll(): T[];
  update(id: string, item: T): T | null;
  deleteOne(id: string): void;
  deleteAll(): void;
}
