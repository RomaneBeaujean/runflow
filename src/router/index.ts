import RaceDetails from '@/components/RaceDetails.vue'
import Races from '@/components/Races.vue'
import Tracks from '@/components/Tracks.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/races' },
  { path: '/tracks', component: Tracks },
  { path: '/races', component: Races },
  { path: '/races/:id', component: RaceDetails, props: true },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
