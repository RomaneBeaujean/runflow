<template>
  <Button icon="pi pi-ellipsis-v" rounded text @click="menu.toggle($event)" />

  <Menu :model="items" popup ref="menu" />
</template>

<script setup lang="ts">
import { useInjection } from '@/lib/useInjection';
import { AppStores } from '@/stores/AppLoader';
import { Race } from '@/types/entities/Race';
import { Button, Menu } from 'primevue';
import type { MenuItem } from 'primevue/menuitem';
import { ref } from 'vue';

const stores = useInjection<AppStores>('stores');
const props = defineProps<{ race: Race; edit: () => void }>();
const menu = ref(null);

const items: MenuItem[] = [
  {
    label: 'Modifier nom / date',
    icon: 'pi pi-pencil',
    command: () => {
      props.edit();
    },
  },
  {
    label: 'Télécharger le plan de course',
    icon: 'pi pi-download',
    command: () => {
      downloadRace();
    },
  },
];

const downloadRace = () => {
  const race = stores.races.getRace(props.race.id);
  if (!race) return;

  const json = JSON.stringify(race, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeName = (props.race.name || 'race')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]/g, '');

  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.runflow.json`;
  a.click();

  URL.revokeObjectURL(url);
};
</script>

<style lang="scss">
.p-menu-item-label {
  font-size: 14px !important;
  color: var(--color-neutral-800);
}
</style>
