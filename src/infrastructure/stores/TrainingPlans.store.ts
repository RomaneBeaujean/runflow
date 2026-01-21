import { createTrainingPlan } from '@/domain/factories/TrainingPlanFactory';
import { TrainingPlan } from '@/domain/types/TrainingPlan';
import { db } from '@/infrastructure/dexie/DexieDatabase';
import { nanoid } from 'nanoid';
import { reactive, toRaw } from 'vue';

export class TrainingPlansStore {
  protected state = reactive<TrainingPlan[]>([]);

  get training_plans(): TrainingPlan[] {
    return this.state;
  }

  init = async () => {
    const raw = await db.training_plans.toArray();
    this.state = raw.map((r) => createTrainingPlan(r));
  };

  getById = (id: string | null): TrainingPlan | null => {
    return id ? this.state.find((r) => r.id === id) || null : null;
  };

  create = async (tp: Partial<TrainingPlan>) => {
    if (!tp.name?.trim()) {
      throw new Error('Le nom du plan est requis');
    }

    const newOne = createTrainingPlan({
      ...tp,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    });

    try {
      await db.training_plans.add(JSON.parse(JSON.stringify(toRaw(newOne))));
      this.state.push(newOne);
      return newOne.id;
    } catch (err) {
      console.error('❌ Create training plan error', err);
      throw err;
    }
  };

  updateById = async (id: string, updated: Partial<TrainingPlan>) => {
    const index = this.state.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const newTrainingPlan = { ...this.state[index], ...updated };

    try {
      await db.training_plans.update(
        id,
        JSON.parse(JSON.stringify(toRaw(newTrainingPlan)))
      );
      this.state[index] = createTrainingPlan(newTrainingPlan);
      return newTrainingPlan;
    } catch (err) {
      console.error('❌ Update training plan error', err);
      throw err;
    }
  };

  deleteById = async (id: string) => {
    await db.training_plans.delete(id);
    this.state = [...this.state].filter((el) => el.id !== id)
  };

  clearAll = async () => {
    await db.training_plans.clear();
    this.state.splice(0);
  };

  importTrainingPlan = async (file: File) => {
    const text = await file.text();
    const planObj = JSON.parse(text);

    if (this.getById(planObj.id)) {
      throw new Error('Ce plan existe déjà');
    }

    await db.training_plans.put(planObj);
    this.state.push(createTrainingPlan(planObj));
  };
}
