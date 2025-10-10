import App from '@/App.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: App,
      children: [
        {
          path: '/tracks',
          name: 'tracks',
          component: () => import('@/components/Tracks.vue'),
        },
        {
          path: '/races',
          name: 'races',
          component: () => import('@/components/Races.vue'),
        },
      ],
    },
  ],
});

export default router;
