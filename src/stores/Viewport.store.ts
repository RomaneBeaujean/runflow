import { reactive } from "vue";

interface State {
  viewportsize: number | null;
}

export class ViewportStore {
  protected state = reactive<State>({
    viewportsize: null
  });

  init() {
    window.addEventListener("resize", this.handleViewportResize);
    this.state.viewportsize = this.getInitialViewportSize();
  }

  handleViewportResize = (resizeEvent: UIEvent) => {
    this.state.viewportsize = (resizeEvent.target as Window).innerWidth;
  };

  get isMobile(): boolean {
    const isMobile = this.state.viewportsize ? this.state.viewportsize < 900 : false;
    return isMobile;
  }

  getInitialViewportSize = (): number => {
    const viewportSize = window.innerWidth;

    return viewportSize;
  };
};
