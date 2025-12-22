<template>
  <template v-if="stores.races_store.races.length > 0">
    <div
      class="grid gap-5 p-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div
        v-for="tp in stores.training_plans_store.training_plans"
        :key="tp.id"
        class="flex flex-col"
      >
        <TrainingCard :trainingPlan="tp" />
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex flex-col items-center text-center py-16 px-6">
      <!-- Icon -->
      <div class="mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          class="h-20 w-20 text-gray-300"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 7h18"
            opacity="0.4"
          />
        </svg>
      </div>

      <!-- Title -->
      <h2 class="text-2xl font-semibold text-gray-800 mb-2">
        Aucun plan d'entrainement
      </h2>

      <!-- Description -->
      <p class="text-gray-500 max-w-md mb-8">
        Créez votre premier plan d'entrainement en cliquant sur le bouton
        "Ajouter un plan d'entrainement". Vous pourrez ensuite définir, semaine
        par semaine, vos différents entrainements.
      </p>
    </div>
  </template>
</template>

<script setup lang="ts">
import { useStores } from '@/ui/composables/useStores';
import TrainingCard from './TrainingCard.vue';

const stores = useStores();
</script>

<style scoped lang="scss"></style>
