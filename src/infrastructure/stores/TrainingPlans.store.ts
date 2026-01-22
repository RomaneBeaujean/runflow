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
    const plans = raw.map((r) => createTrainingPlan(r));
    this.state.splice(0, this.state.length, ...plans);
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
    const existing = await db.training_plans.get(id);
    if (!existing) return;

    const newOne = { ...existing, ...updated };
    const cleaned = JSON.parse(JSON.stringify(toRaw(newOne)));

    try {
      await db.training_plans.update(id, cleaned);
      await this.init();
      return newOne;
    } catch (err) {
      console.error('❌ Dexie updateRace error', err, cleaned);
    }
  };

  deleteById = async (id: string) => {
    await db.training_plans.delete(id);
    await this.init();
  };

  clearAll = async () => {
    await db.training_plans.clear();
     this.state = [];
  };

  importTrainingPlan = async (file: File) => {
    const text = await file.text();
    const jsonFile = JSON.parse(text);

    if (this.getById(jsonFile.id)) {
      throw new Error('Ce plan existe déjà');
    }

    await db.training_plans.put(jsonFile);
    await this.init();
    alert('Plan d\'entrainement importé avec succès !');
  };
}
