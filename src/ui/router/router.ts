import Lab from '@/ui/pages/lab/Lab.vue';
import Races from '@/ui/pages/races/Races.vue';
import Race from '@/ui/pages/races/race/Race.vue';
import { createRouter, createWebHistory } from 'vue-router';
import TrainingPlans from '../pages/training-plan/TrainingPlans.vue';
import TrainingPlan from '../pages/training-plan/training-plan/TrainingPlan.vue';

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
      component: TrainingPlans,
    },
    { path: '/trainings/:id', component: TrainingPlan, props: true },
  ],
});

export default router;
