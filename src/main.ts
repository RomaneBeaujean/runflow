import '@/main.scss';
import 'primeicons/primeicons.css';

import router from '@/router/router';
import '@/style.css';
import { createApp } from 'vue';
import App from './App.vue';
import { configurePrimeVue } from './config/primevue-config';
import { AppLoader } from './stores/AppLoader';

const app = createApp(App);
configurePrimeVue(app);
app.use(router);

const loader = new AppLoader();

(async () => {
  await loader.init(app);
  app.mount('#app');
})();
