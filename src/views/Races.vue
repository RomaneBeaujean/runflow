<template>
  <div class="flex items-center justify-between">
    <AddNewRace />
    <EllipsisMenu />
  </div>
  <RacesList />
</template>

<script setup lang="ts">
import AddNewRace from '@/components/race/AddNewRace.vue';
import EllipsisMenu from '@/components/race/EllipsisMenu.vue';
import RacesList from '@/components/races/RacesList.vue';
</script>

<style lang="scss" scoped></style>
