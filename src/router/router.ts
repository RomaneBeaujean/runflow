import Lab from '@/components/Lab.vue';
import Race from '@/views/Race.vue';
import Races from '@/views/Races.vue';
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
      path: '/:catchAll(.*)',
      redirect: '/',
    },
    {
      path: '/lab',
      name: 'Lab',
      component: Lab,
    },
  ],
});

export default router;
