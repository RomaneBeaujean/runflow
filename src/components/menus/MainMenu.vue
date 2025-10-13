<template>
  <Toolbar class="p-3 flex justify-between">
    <!-- Gauche -->
    <template #start>
      <div class="flex items-center">
        <img src="@/assets/logo.png" alt="Logo" class="h-10 mr-4" />

        <Button
          v-for="item in items"
          :key="item.path"
          :label="item.label"
          :icon="item.illustration"
          :text="!isActive(item.path)"
          @click="selectItem(item.path)"
          class="m-2"
        />
      </div>
    </template>

    <!-- Droite -->
    <template #end>
      <div class="flex items-center">
        <ToolbarEllipsisMenu />
      </div>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import { useInjection } from '@/lib/useInjection';
import router from '@/router/router';
import { AppStores } from '@/stores/AppLoader';
import { Button, Toolbar } from 'primevue';
import { ref } from 'vue';
import ToolbarEllipsisMenu from '../ToolbarEllipsisMenu.vue';

const stores = useInjection<AppStores>('stores');

const items = [
  { label: 'Plans de course', path: 'races', illustration: 'pi pi-map' },
];

const getInitialRoute = (): string => {
  const segments = window.location.pathname.split('/').filter(Boolean);
  return segments[0] || 'overview';
};
const activeRoute = ref(getInitialRoute());
const isActive = (path: string) => activeRoute.value === path;
const selectItem = (path: string) => {
  activeRoute.value = path;
  router.push({ path: `/${path}` }).catch((err) => {
    if (
      err.name !== 'NavigationDuplicated' &&
      !err.message.includes('Avoided redundant navigation')
    )
      console.error(err);
  });
};

const fileInput = ref<HTMLInputElement>();
const triggerFileInput = () => {
  fileInput.value?.click();
};
</script>

<style lang="scss"></style>
