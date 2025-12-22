import Lab from '@/ui/pages/lab/Lab.vue';
import Races from '@/ui/pages/races/Races.vue';
import Race from '@/ui/pages/races/race/Race.vue';
import Trainings from '@/ui/pages/trainings/Trainings.vue';
import Training from '@/ui/pages/trainings/training/Training.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/races',
    },
    {
      path: '/races',
      name: 'races',
      component: Races,
    },
    { path: '/races/:id', component: Race, props: true },
    {
      path: '/lab',
      name: 'Lab',
      component: Lab,
    },
    {
      path: '/trainings',
      name: 'trainings',
      component: Trainings,
    },
    { path: '/trainings/:id', component: Training, props: true },
  ],
});

export default router;
