import Lab from '@/components/lab/Lab.vue';
import Race from '@/views/Race.vue';
import Races from '@/views/Races.vue';
import Trainings from '@/views/Trainings.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // {
    //   path: '/',
    //   name: 'Home',
    //   component: Home,
    // },
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
  ],
});

export default router;
