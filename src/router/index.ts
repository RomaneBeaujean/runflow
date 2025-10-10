import RaceDetails from '@/components/RaceDetails.vue';
import Races from '@/components/Races.vue';
import Tracks from '@/components/Tracks.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
    { path: '/races/:id', component: RaceDetails, props: true },
  ],
});

export default router;
