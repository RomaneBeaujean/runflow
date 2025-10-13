import { ViewportStore } from '@/stores/Viewport.store';
import { reactive, type App } from 'vue';
import { GlobalStore } from './Global.store';
import { RacesStore } from './Races.store';

export interface AppStores {
  viewports: ViewportStore;
  global: GlobalStore;
  races: RacesStore;
}
export class AppLoader {
  private _stores = reactive<AppStores>({
    viewports: new ViewportStore(),
    global: new GlobalStore(),
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
