<template>
  <template v-if="!isMobile">
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
          <div class="flex gap-2">
            <Tag
              severity="info"
              :value="getRaceTotalDistance(data.gpxContent)"
            ></Tag>
            <Tag
              severity="warn"
              :value="getRaceTotalElevation(data.gpxContent)"
            ></Tag>
          </div>
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
  </template>
  <template v-else>
    <Fieldset
      v-for="race in stores.races.races"
      class="mb-3"
      @click="goToCourse(race.id)"
    >
      <template #legend>
        <div class="flex flex-row gap-2 items-center">
          <div class="text-sm font-bold">
            {{ race.name }}
          </div>
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            size="small"
            @click.stop="deleteCourse(race.id)"
          />
        </div>
      </template>
      <div>
        <div class="flex justify-center gap-2">
          <ColorTag
            color="primary"
            :label="getRaceTotalDistance(race.gpxContent)"
          ></ColorTag>
          <ColorTag
            color="amber"
            :label="getRaceTotalElevation(race.gpxContent)"
          ></ColorTag>
          <ColorTag color="green" v-if="race.date" icon="pi pi-calendar">
            {{ new Date(race.date).toLocaleDateString('fr-FR') }}
          </ColorTag>
        </div>
      </div>
    </Fieldset>
  </template>
</template>

<script setup lang="ts">
import { useGpxParser } from '@/composables/useGpxParser';
import { useViewport } from '@/composables/useViewport';
import { useInjection } from '@/lib/useInjection';
import { roundOneNumber } from '@/lib/utils';
import type { AppStores } from '@/stores/AppLoader';
import {
  Button,
  Column,
  DataTable,
  DataTableRowClickEvent,
  Fieldset,
  Tag,
} from 'primevue';
import { useRouter } from 'vue-router';
import ColorTag from '../ColorTag.vue';
const { isMobile } = useViewport();
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
