<template>
  <div class="flex justify-end">
    <Button
      icon="pi pi-ellipsis-v"
      class="p-button-sm p-button-text p-button-rounded"
      @click="menu.toggle($event)"
    />

    <Menu :model="items" popup ref="menu" />
  </div>
</template>

<script setup lang="ts">
import { useInjection } from '@/lib/useInjection';
import { AppStores } from '@/stores/AppLoader';
import { Button, Menu } from 'primevue';
import { MenuItem } from 'primevue/menuitem';
import { ref } from 'vue';

const stores = useInjection<AppStores>('stores');

const menu = ref(null);

const items: MenuItem[] = [
  {
    label: 'Importer un fichier',
    icon: 'pi pi-file',
    class: 'text-sm',
    command: () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.runflow.json';
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        await stores.races.importRace(file); // ici file est bien un File
      };
      input.click();
    },
  },
];
</script>

<style lang="scss" scoped></style>
