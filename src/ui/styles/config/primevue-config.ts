import '@fortawesome/fontawesome-free/css/all.css';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import { locale } from './primevue-locale';
const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      '50': '#e6f2f8',
      '100': '#b1d5e8',
      '200': '#8cc1dd',
      '300': '#57a5ce',
      '400': '#3693c5',
      '500': '#026296ff',
      '600': '#024264ff',
      '700': '#013552ff',
      '800': '#013049ff',
      '900': '#011f30ff',
    },
  },
});

export function configurePrimeVue(app: any) {
  app.use(PrimeVue, {
    theme: {
      preset: MyPreset,
    },
    locale: locale,
  });
}
