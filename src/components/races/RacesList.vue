<template>
  <div
    class="grid gap-5 p-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  >
    <div
      v-for="race in stores.races.races"
      :key="race.id"
      class="flex flex-col"
    >
      <RaceCard :race="race" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStores } from '@/composables/useStores';
import RaceCard from './RaceCard.vue';

const stores = useStores();
</script>

<style scoped lang="scss"></style>
