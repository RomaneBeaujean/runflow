<template>
  <div v-if="race" id="race">
    <div id="race-header" class="full-w">
      <RaceHeader :race="race" />
    </div>
    <div id="chart">
      <RaceChart />
    </div>
    <div id="table">
      <RaceTable />
    </div>
  </div>
  <div v-else class="flex justify-center items-center h-40 text-gray-500">
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
import { useInjection } from '@/lib/useInjection';
import type { AppStores } from '@/stores/AppLoader';
import { onMounted, watch } from 'vue';

import RaceChart from '@/components/RaceChart.vue';
import RaceHeader from '@/components/RaceHeader.vue';
import RaceTable from '@/components/RaceTable.vue';
import { useRace } from '@/composables/useRace';
import { ProgressSpinner } from 'primevue';

const props = defineProps<{ id: string }>();
const stores = useInjection<AppStores>('stores');
const { splits, separators, race, startTime, initRace } = useRace();

const initRaceComposable = async () => {
  if (!props.id) return;
  const raceData = stores.races.getRace(props.id);
  if (!raceData) return;
  initRace(raceData);
};

onMounted(() => initRaceComposable());

watch(
  () => props.id,
  () => initRaceComposable()
);

watch(
  [splits, separators, startTime],
  () => {
    stores.races.updateRace(race.value.id, {
      separators: separators.value,
      splits: splits.value,
      startTime: startTime.value,
    });
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
#race {
  height: 100%;
  width: 100%;
  overflow-y: auto;
}

#chart {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 300px;
  background-color: white;
}
</style>
