import { locale } from '@/ui/styles/config/primevue-locale';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';

const MyPreset = definePreset(Aura, {
  semantic: {
    // Olive
    // primary: {
    //   50: '#eef1eb', // très clair
    //   100: '#dbe3d1',
    //   200: '#c7d5b7',
    //   300: '#b3c79d',
    //   400: '#9fb983',
    //   500: '#6B7D55', // couleur de base
    //   600: '#5f714c',
    //   700: '#4f5f40',
    //   800: '#404d34',
    //   900: '#2f3926', // très foncé
    // },
    // Bleu canard
    primary: {
      50: '#E0F4F2', // très clair — presque menthe
      100: '#B3E3DF',
      200: '#80D1CA',
      300: '#4DBFB5',
      400: '#26AFA4',
      500: '#00786F', // couleur de base
      600: '#006D65',
      700: '#005C55',
      800: '#004C46',
      900: '#00332F', // très foncé — profond et équilibré
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
