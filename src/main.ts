import '@/main.scss';
import 'primeicons/primeicons.css';

import App from '@/App.vue';
import { configurePrimeVue } from '@/config/primevue-config';
import router from '@/router/router';
import { AppLoader } from '@/stores/AppLoader';
import '@/style.css';
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
