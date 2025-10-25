import { reactive, type App } from 'vue';
import { RacesStore } from './Races.store';

export interface AppStores {
  races: RacesStore;
}
export class AppLoader {
  private _stores = reactive<AppStores>({
    races: new RacesStore(),
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
