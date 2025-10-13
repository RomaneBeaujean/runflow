<template>
  <Toolbar class="p-3">
    <template #start>
      <Button
        v-for="item in items"
        :label="item.label"
        :icon="item.illustration"
        :text="!isActive(item.path)"
        @click="selectItem(item.path)"
        class="m-2"
      />
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import router from '@/router/router';
import { Button, Toolbar } from 'primevue';
import { ref } from 'vue';

// items de navigation
const items = [
  { label: 'Plans de course', path: 'races', illustration: 'pi pi-map' },
];

// active route = premier segment de l'URL
const getInitialRoute = (): string => {
  const segments = window.location.pathname.split('/').filter(Boolean);
  return segments[0] || 'overview';
};
const activeRoute = ref(getInitialRoute());

// check si un item est actif
const isActive = (path: string) => activeRoute.value === path;

// sélection d’un item
const selectItem = (path: string) => {
  activeRoute.value = path;

  // forcer le push absolu sur la route principale
  router.push({ path: `/${path}` }).catch((err) => {
    // ignorer les erreurs de navigation redondante
    if (
      err.name !== 'NavigationDuplicated' &&
      !err.message.includes('Avoided redundant navigation')
    )
      console.error(err);
  });
};
</script>

<style lang="scss"></style>
