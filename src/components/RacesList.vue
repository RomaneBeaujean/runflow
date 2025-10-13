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
      @row-click="onRowClick"
      :rowClass="() => 'cursor-pointer'"
    >
      <!-- Nom du plan -->
      <Column header="Nom du plan">
        <template #body="{ data }">
          <span
            class="truncate text-gray-800 font-medium cursor-pointer"
            @click="goToCourse(data.id)"
          >
            {{ data.name }}
          </span>
        </template>
      </Column>

      <Column>
        <template #body="{ data }">
          <Tag
            severity="info"
            :value="getRaceTotalDistance(data.gpxContent)"
            class="mr-3"
          ></Tag>
          <Tag
            severity="warn"
            :value="getRaceTotalElevation(data.gpxContent)"
          ></Tag>
        </template>
      </Column>

      <Column header="Date de création">
        <template #body="{ data }">
          {{ new Date(data.createdAt).toLocaleDateString() }}
        </template>
      </Column>

      <!-- Actions -->
      <Column style="width: 100px; text-align: center">
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
import { useGpxParser } from '@/composables/useGpxParser';
import { useInjection } from '@/lib/useInjection';
import { roundOneNumber } from '@/lib/utils';
import type { AppStores } from '@/stores/AppLoader';
import {
  Button,
  Column,
  DataTable,
  DataTableRowClickEvent,
  Tag,
} from 'primevue';
import { useRouter } from 'vue-router';

const stores = useInjection<AppStores>('stores');
const router = useRouter();
const { deleteRace } = stores.races;

const getRaceTotalDistance = (gpxContent: string) => {
  const { gpxtotalDistance } = useGpxParser(gpxContent);
  return roundOneNumber(gpxtotalDistance) + ' km';
};

const getRaceTotalElevation = (gpxContent: string) => {
  const { gpxtotalElevation } = useGpxParser(gpxContent);
  return roundOneNumber(gpxtotalElevation) + ' d+';
};

function onRowClick(event: DataTableRowClickEvent<any>) {
  const id = event.data.id;
  router.push(`/races/${id}`);
}

function goToCourse(id: string) {
  router.push(`/races/${id}`);
}

function deleteCourse(id: string) {
  deleteRace(id);
}
</script>

<style scoped lang="scss"></style>
