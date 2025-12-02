<template>
  <template v-if="!isMobile">
    <div class="p-5 relative bg-white shadow-xs">
      <div class="absolute">
        <AppLogo />
      </div>
      <div class="flex flex-1 justify-center items-center gap-4">
        <nav class="flex w-max gap-4">
          <Button
            v-for="item in items"
            :key="item.label"
            @click="selectItem(item.path)"
            :label="item.label"
            :icon="item.illustration"
            :text="!isActive(item.path)"
          />
        </nav>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="p-5 relative">
      <div class="absolute">
        <Button icon="pi pi-bars" text @click="drawerVisible = true" />
      </div>
      <div class="flex justify-center">
        <AppLogo />
      </div>
    </div>
    <Drawer v-model:visible="drawerVisible">
      <template #header>
        <div class="flex justify-center w-full">
          <AppLogo class="w-[150px]" />
        </div>
      </template>
      <div class="flex flex-col items-stretch mt-8 select-none">
        <div
          class="mobile-menu-item"
          v-for="item in items"
          :key="item.path"
          :data-active="isActive(item.path) ? true : null"
          @click="selectItem(item.path)"
        >
          <i
            v-if="item.illustration"
            :class="item.illustration"
            class="mr-4"
          ></i>
          {{ item.label }}
        </div>
      </div>
    </Drawer>
  </template>
</template>

<script setup lang="ts">
import { useViewport } from '@/composables/useViewport';
import router from '@/router/router';
import { Button, Drawer } from 'primevue';
import { ref } from 'vue';
import AppLogo from '../logo/AppLogo.vue';

const { isMobile } = useViewport();
const drawerVisible = ref(false);

const items = [
  { label: 'Accueil', path: '', illustration: 'pi pi-home' },
  { label: 'Plans de course', path: 'races', illustration: 'pi pi-trophy' },
  {
    label: "Plans d'entrainement",
    path: 'trainings',
    illustration: 'pi pi-bolt',
  },
  {
    label: 'Planificateur de randonnées',
    path: 'trails',
    illustration: 'pi pi-calendar',
  },
  // { label: 'Laboratoire', path: 'lab', illustration: 'pi pi-map' },
];

const getInitialRoute = (): string => {
  const segments = window.location.pathname.split('/').filter(Boolean);
  return segments[0] || '';
};
const activeRoute = ref(getInitialRoute());
const isActive = (path: string) => activeRoute.value === path;
const selectItem = (path: string) => {
  router
    .push({ path: `/${path}` })
    .then(() => {
      drawerVisible.value = false;
      activeRoute.value = path;
    })
    .catch((err) => {
      if (
        err.name !== 'NavigationDuplicated' &&
        !err.message.includes('Avoided redundant navigation')
      )
        console.error(err);
    });
};
</script>

<style lang="scss" scoped>
.mobile-menu-item {
  display: flex;
  align-items: center;
  padding: 8px;
  color: var(--color-grey-700);
  font-weight: 700;
  border-radius: 4px;
  margin-bottom: 8px;

  &[data-active] {
    color: var(--p-primary-600);
  }

  &:focus,
  &:active,
  &:hover {
    cursor: pointer;
    background-color: var(--p-primary-50);
  }
}
</style>
