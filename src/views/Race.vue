<template>
  <div v-if="race" id="race" :class="classes">
    <div id="race-header">
      <RaceHeader />
    </div>
    <Divider />
    <div class="flex justify-end pb-3">
      <RaceChartParams />
    </div>
    <div id="chart">
      <RaceChart />
    </div>
    <Divider />
    <div class="flex justify-end p-3">
      <SwitchToggle label="Mode édition" v-model="editableMode" />
    </div>
    <div id="splits" class="p-2">
      <RaceSplits />
    </div>
  </div>
  <div v-else class="flex justify-center items-center h-40 text-gray-500">
    <ProgressSpinner />
  </div>
  <RaceRecapChartModal />
  <RaceRecapTableModal />
</template>

<script setup lang="ts">
import RaceChart from '@/components/race/chart/RaceChart.vue';
import RaceHeader from '@/components/race/header/RaceHeader.vue';
import RaceChartParams from '@/components/race/RaceChartParams.vue';
import RaceRecapChartModal from '@/components/race/recap/RaceRecapChartModal.vue';
import RaceRecapTableModal from '@/components/race/recap/RaceRecapTableModal.vue';
import RaceSplits from '@/components/race/splits/RaceSplits.vue';
import SwitchToggle from '@/components/SwitchToggle.vue';
import { useRace } from '@/composables/useRace';
import { useRaceChartParams } from '@/composables/useRaceChartParams';
import { useViewport } from '@/composables/useViewport';
import { useInjection } from '@/lib/useInjection';
import type { AppStores } from '@/stores/AppLoader';
import { Divider, ProgressSpinner } from 'primevue';
import { computed, onMounted, watch } from 'vue';

const props = defineProps<{ id: string }>();
const stores = useInjection<AppStores>('stores');
const { splits, separators, race, startTime, initRace } = useRace();
const { stickyChart, editableMode } = useRaceChartParams();
const { isMobile } = useViewport();

const classes = computed(() => {
  return [
    'race',
    stickyChart.value ? 'sticky' : '',
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
    height: 450px;
  }
}

.mobile {
  #chart {
    height: 250px;
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
      top: 250px !important;
    }
  }

  &.desktop {
    #race-table .header-row {
      top: 450px !important;
    }
  }
}
</style>
