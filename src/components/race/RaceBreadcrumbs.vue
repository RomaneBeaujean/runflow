<template>
  <Breadcrumb :model="items" class="text-sm"> </Breadcrumb>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Race } from '@/types/entities/Race';
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
</script>

<style scoped lang="scss"></style>
