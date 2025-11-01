// src/config/primevue-config.ts
import { locale } from '@/config/primevue-locale';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e6f2f8',
      100: '#b1d5e8',
      200: '#8cc1dd',
      300: '#57a5ce',
      400: '#3693c5',
      500: '#0478b6',
      600: '#046da6',
      700: '#035581',
      800: '#024264',
      900: '#02324c',
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
