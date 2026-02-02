<template>
  <Button icon="pi pi-ellipsis-v" rounded text @click="menu.toggle($event)" />
  <Menu :model="items" popup ref="menu" />
</template>

<script setup lang="ts">
import { useStores } from '@/ui/composables/useStores';
import { Button, Menu } from 'primevue';
import type { MenuItem } from 'primevue/menuitem';
import { ref } from 'vue';

const stores = useStores();
const props = defineProps<{ trainingPlanId: string; edit: () => void }>();
const menu = ref(null);

const items: MenuItem[] = [
  {
    label: 'Modifier le nom du plan',
    icon: 'pi pi-pencil',
    command: () => {
      props.edit();
    },
  },
  {
    label: 'Exporter le plan de course',
    icon: 'pi pi-file-export',
    command: () => {
      exportFile();
    },
  }
];

const exportFile = () => {
  const trainingPlanObj = stores.training_plans_store.getById(props.trainingPlanId);
  if (!trainingPlanObj) return;

  const json = JSON.stringify(trainingPlanObj, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeName = (trainingPlanObj.name || 'plan-d-entrainement')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]/g, '');

  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.tp.runflow.json`;
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
