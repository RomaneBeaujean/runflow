<template>
  <Toolbar style="border-radius: 0 !important">
    <template #start v-if="!isMobile">
      <div class="flex items-center">
        <img src="@/assets/logo.png" alt="Logo" class="h-8 mr-4" />

        <Button
          v-for="item in items"
          :key="item.path"
          :label="item.label"
          :icon="item.illustration"
          size="small"
          text
          :severity="isActive(item.path) ? 'primary' : 'secondary'"
          @click="selectItem(item.path)"
        />
      </div>
    </template>

    <template #start v-if="isMobile">
      <Button
        icon="pi pi-bars"
        severity="secondary"
        text
        @click="drawerVisible = true"
      />
    </template>
    <template #center v-if="isMobile">
      <img src="@/assets/logo.png" alt="Logo" class="h-6" />
    </template>
  </Toolbar>
  <Drawer v-model:visible="drawerVisible">
    <template #header>
      <img src="@/assets/logo.png" alt="Logo" class="h-6" />
    </template>
    <div class="flex flex-col items-stretch">
      <div
        class="mobile-menu-item"
        v-for="item in items"
        :key="item.path"
        :data-active="isActive(item.path) ? true : null"
        @click="selectItem(item.path)"
      >
        <i v-if="item.illustration" :class="item.illustration" class="mr-4"></i>
        {{ item.label }}
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { useViewport } from '@/composables/useViewport';
import router from '@/router/router';
import { Button, Drawer, Toolbar } from 'primevue';
import { ref } from 'vue';

const drawerVisible = ref(false);

const { isMobile } = useViewport();

const items = [
  { label: 'Plans de course', path: 'races', illustration: 'pi pi-map' },
  // { label: 'Laboratoire', path: 'lab', illustration: 'pi pi-map' },
];

const getInitialRoute = (): string => {
  const segments = window.location.pathname.split('/').filter(Boolean);
  return segments[0] || 'overview';
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

  &[data-active] {
    color: var(--color-primary-700);
  }

  &:focus,
  &:active,
  &:hover {
    cursor: pointer;
    background-color: var(--color-blue-50);
  }
}
</style>
