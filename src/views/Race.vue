<template>
  <div>
    <Breadcrumb :model="items" class="text-sm"> </Breadcrumb>

    <div v-if="race" class="space-y-6">
      <Fieldset legend="Profil de la course">
        <RaceChart />
      </Fieldset>

      <Fieldset legend="Splits">
        <RaceTable />
      </Fieldset>
    </div>

    <div v-else class="flex justify-center items-center h-40 text-gray-500">
      <ProgressSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInjection } from '@/lib/useInjection';
import type { AppStores } from '@/stores/AppLoader';
import { onMounted, ref, watch } from 'vue';

import RaceChart from '@/components/chart/RaceChart.vue';
import RaceTable from '@/components/table/RaceTable.vue';
import { useRace } from '@/composables/useRace';
import { Fieldset } from 'primevue';
import Breadcrumb from 'primevue/breadcrumb';
import { MenuItem } from 'primevue/menuitem';
import ProgressSpinner from 'primevue/progressspinner';

const props = defineProps<{ id: string }>();
const stores = useInjection<AppStores>('stores');
const { splits, race, initRace } = useRace();

const items = ref<MenuItem[]>([
  { label: 'Plans de course', url: '/races' },
  { label: 'Détails', disabled: true },
]);

const initRaceComposable = async () => {
  if (!props.id) return;
  const raceData = stores.races.getRace(props.id);
  if (!raceData) return;
  const track = stores.tracks.getTrack(raceData.trackId);
  initRace(raceData, track);
};

onMounted(() => initRaceComposable());

watch(
  () => props.id,
  () => initRaceComposable()
);

watch(
  () => splits,
  () => {
    if (race.value.splits !== splits.value) {
      stores.races.updateRace(race.value.id, {
        splits: splits.value,
      });
    }
  },
  { deep: true }
);
</script>

<style scoped></style>
