<template>
  <div class="m-4">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">
      Plans de courses existants
    </h2>

    <DataTable
      :value="stores.races.races"
      responsiveLayout="scroll"
      emptyMessage="Aucun plan de course pour le moment."
      rowHover
    >
      <!-- Nom du plan -->
      <Column field="name" header="Nom du plan" :sortable="true">
        <template #body="{ data }">
          <span
            class="truncate text-gray-800 font-medium cursor-pointer"
            @click="goToCourse(data.id)"
          >
            {{ data.name }}
          </span>
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" style="width: 100px; text-align: center">
        <template #body="{ data }">
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            @click.stop="deleteCourse(data.id)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { useInjection } from '@/lib/useInjection';
import type { AppStores } from '@/stores/AppLoader';
import { Button, Column, DataTable } from 'primevue';
import { useRouter } from 'vue-router';

const stores = useInjection<AppStores>('stores');
const router = useRouter();

function goToCourse(id: string) {
  router.push(`/races/${id}`);
}

function deleteCourse(id: string) {
  console.log('Supprimer le plan :', id);
}
</script>

<style scoped lang="scss"></style>
