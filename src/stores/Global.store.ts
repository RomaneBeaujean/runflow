import { reactive } from "vue";

interface State {
  trainingModalOpened: boolean;
  trainingDetailsOpened: boolean;
  trainingDetailsOpenedId: string | null;
}

export class GlobalStore {
  public state = reactive<State>({
    trainingModalOpened: false,
    trainingDetailsOpened: false,
    trainingDetailsOpenedId: null,
  });

  public update<K extends keyof State>(prop: K, value: State[K]) {
    this.state[prop] = value;
  }

  public get<K extends keyof State>(prop: K): State[K] {
    return this.state[prop];
  }
};
