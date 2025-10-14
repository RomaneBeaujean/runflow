<template>
  <div class="flex items-center justify-between">
    <AddNewRace />
    <EllipsisMenu />
  </div>
  <RacesList />
</template>

<script setup lang="ts">
import AddNewRace from '@/components/AddNewRace.vue';
import EllipsisMenu from '@/components/EllipsisMenu.vue';
import RacesList from '@/components/RacesList.vue';
</script>

<style lang="scss" scoped></style>
