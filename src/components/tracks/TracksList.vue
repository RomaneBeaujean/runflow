<template>
  <div class="m-4">
    <DataTable :value="stores.tracks.tracks" stripedRows>
      <Column field="name" header="Nom" />
      <Column field="createdAt" header="Importé le" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { useInjection } from '@/lib/useInjection';
import type { AppStores } from '@/stores/AppLoader';
import { Column, DataTable } from 'primevue';

const stores = useInjection<AppStores>('stores');
</script>

<style scoped lang="scss"></style>
