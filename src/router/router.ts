import Race from '@/views/Race.vue';
import Races from '@/views/Races.vue';
import Tracks from '@/views/Tracks.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/tracks',
    },
    {
      path: '/tracks',
      name: 'tracks',
      component: Tracks,
    },
    {
      path: '/races',
      name: 'races',
      component: Races,
    },
    { path: '/races/:id', component: Race, props: true },
  ],
});

export default router;
