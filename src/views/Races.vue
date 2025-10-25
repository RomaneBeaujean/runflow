<template>
  <div class="p-8 flex justify-between">
    <div>
      <div class="text-xl font-bold flex text-primary-700">
        Plans de courses
      </div>
      <div class="text-xs text-grey-500 mt-2">
        Consultez vos plans de courses ou ajoutez-en de nouveaux
      </div>
    </div>
    <div>
      <EllipsisMenu />
    </div>
  </div>

  <div class="flex justify-center">
    <AddNewRace />
  </div>

  <div class="p-8">
    <div class="text-l font-bold flex text-primary-700 mb-5">
      Plans de course existants
    </div>
    <RacesList />
  </div>
</template>

<script setup lang="ts">
import AddNewRace from '@/components/race/AddNewRace.vue';
import EllipsisMenu from '@/components/race/EllipsisMenu.vue';
import RacesList from '@/components/races/RacesList.vue';
</script>

<style lang="scss" scoped></style>
