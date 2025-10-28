<template>
  <div v-if="race" id="race" :class="classes">
    <div id="race-header">
      <RaceHeader />
    </div>
    <div id="chart">
      <RaceChart />
    </div>
    <div id="splits" class="p-2">
      <RaceSplits />
    </div>
  </div>
  <div v-else class="flex justify-center items-center h-40 text-gray-500">
    <ProgressSpinner />
  </div>
  <RaceRecapModal />
</template>

<script setup lang="ts">
import { useInjection } from '@/lib/useInjection';
import type { AppStores } from '@/stores/AppLoader';
import { computed, onMounted, watch } from 'vue';

import RaceChart from '@/components/race/chart/RaceChart.vue';
import RaceHeader from '@/components/race/header/RaceHeader.vue';
import RaceRecapModal from '@/components/race/recap/RaceRecapModal.vue';
import RaceSplits from '@/components/race/splits/RaceSplits.vue';
import { useRace } from '@/composables/Race/useRace';
import { useRaceFilters } from '@/composables/Race/useRaceFilters';
import { useViewport } from '@/composables/useViewport';
import { ProgressSpinner } from 'primevue';

const props = defineProps<{ id: string }>();
const stores = useInjection<AppStores>('stores');
const { splits, separators, race, startTime, initRace } = useRace();
const { sticky } = useRaceFilters();
const { isMobile } = useViewport();

const classes = computed(() => {
  return [
    'race',
    sticky.value ? 'sticky' : '',
    isMobile.value ? 'mobile' : 'desktop',
  ].join(' ');
});

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

<style lang="scss">
#race {
  display: flex;
  padding: 8px;
  flex-direction: column;
}

#race-header,
#chart {
  flex: 1 1 auto;
  background-color: white;
  position: relative;
}

#race-table .header-row {
  position: sticky;
  background-color: white;
  height: auto;
  z-index: 30;
  top: 0;
}

#race-table .p-datatable-table-container {
  overflow-x: unset !important;
  overflow-y: unset !important;
}

.desktop {
  #chart {
    height: 400px;
  }
}

.mobile {
  #chart {
    height: 200px;
  }
}

.sticky {
  #chart {
    position: sticky;
    top: 0;
    z-index: 40;
  }

  &.mobile {
    #race-table .header-row {
      top: 200px !important;
    }
  }

  &.desktop {
    #race-table .header-row {
      top: 400px !important;
    }
  }
}
</style>
