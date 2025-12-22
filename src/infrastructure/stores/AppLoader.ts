import { RacesStore } from '@/infrastructure/stores/Races.store';
import { reactive, type App } from 'vue';
import { TrainingPlansStore } from './TrainingPlans.store';

export interface AppStores {
  races_store: RacesStore;
  training_plans_store: TrainingPlansStore;
}
export class AppLoader {
  private _stores = reactive<AppStores>({
    races_store: new RacesStore(),
    training_plans_store: new TrainingPlansStore(),
  });

  async initAll() {
    const initFns = Object.values(this._stores)
      .filter((store: any) => typeof store.init === 'function')
      .map((store: any) => store.init());

    await Promise.all(initFns);
  }

  async init(app: App) {
    await this.initAll();
    app.provide('stores', this._stores);
  }
}
