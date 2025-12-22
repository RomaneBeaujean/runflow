import App from '@/App.vue';
import { AppLoader } from '@/infrastructure/stores/AppLoader';
import router from '@/ui/router/router';
import { configurePrimeVue } from '@/ui/styles/config/primevue-config';
import '@/ui/styles/main.scss';
import '@/ui/styles/style.css';
import 'primeicons/primeicons.css';
import Tooltip from 'primevue/tooltip';
import { createApp } from 'vue';

const app = createApp(App);
configurePrimeVue(app);
app.use(router);
app.directive('tooltip', Tooltip);

const loader = new AppLoader();

(async () => {
  await loader.init(app);
  app.mount('#app');
})();
