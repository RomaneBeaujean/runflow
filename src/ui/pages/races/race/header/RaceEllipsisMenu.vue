<template>
  <Button icon="pi pi-ellipsis-v" rounded text @click="menu.toggle($event)" />
  <Menu :model="items" popup ref="menu" />
</template>

<script setup lang="ts">
import { Race } from '@/domain/types/Race';
import { useNutrition } from '@/ui/composables/useNutrition';
import { useRaceRecap } from '@/ui/composables/useRaceRecap';
import { useStores } from '@/ui/composables/useStores';
import { Button, Menu } from 'primevue';
import type { MenuItem } from 'primevue/menuitem';
import { ref } from 'vue';

const stores = useStores();
const props = defineProps<{ race: Race; edit: () => void }>();
const menu = ref(null);
const { showTableModal, showChartModal } = useRaceRecap();
const { getProduct } = useNutrition();

const items: MenuItem[] = [
  {
    label: 'Modifier nom / date',
    icon: 'pi pi-pencil',
    command: () => {
      props.edit();
    },
  },
  {
    label: 'Exporter le plan de course',
    icon: 'pi pi-file-export',
    command: () => {
      downloadRace();
    },
  },
  {
    label: 'Télécharger le tableau récapitulatif',
    icon: 'pi pi-download',
    command: () => {
      showTableModal.value = true;
    },
  },
  {
    label: 'Télécharger le profil de la course',
    icon: 'pi pi-download',
    command: () => {
      showChartModal.value = true;
    },
  },
];

const downloadRace = () => {
  const race = stores.races_store.getById(props.race.id);
  if (!race) return;

  const referencedIds = new Set<string>();
  (race.separators || []).forEach((sep: any) => {
    (sep.nutrition?.products || []).forEach((p: any) => referencedIds.add(p.productId));
  });
  const nutritionProducts = [...referencedIds].map((id) => getProduct(id)).filter(Boolean);

  const exportData = nutritionProducts.length ? { ...race, nutritionProducts } : race;
  const json = JSON.stringify(exportData, null, 2);
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
