<template>
  <Breadcrumb :model="items" class="text-sm"> </Breadcrumb>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { Race } from '@/domain/types/Race';
import { Breadcrumb } from 'primevue';
import type { MenuItem } from 'primevue/menuitem';

const items = ref<MenuItem[]>([]);
const props = defineProps<{ race: Race }>();

onMounted(() => {
  if (!props.race) return;
  items.value = [
    { label: 'Plans de course', url: '/races' },
    { label: props.race.name, disabled: true },
  ];
});

watch(props.race, () => {
  items.value = [
    { label: 'Plans de course', url: '/races' },
    { label: props.race.name, disabled: true },
  ];
});
</script>

<style scoped lang="scss">
.p-breadcrumb {
  padding-left: 0;
  display: flex;
  max-width: 700px;
  overflow: hidden;
}

:deep(.p-breadcrumb-list) {
  display: flex;
  flex: 1;
  min-width: 0;
}

:deep(.p-breadcrumb-item) {
  flex-shrink: 1;
  min-width: 0;
}

:deep(a .p-breadcrumb-item-label) {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
