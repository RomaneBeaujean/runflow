<template>
  <div
    v-if="race"
    id="race"
    :class="[
      'race flex p-5 flex-col relative',
      stickyChart && 'sticky',
      isMobile ? 'mobile' : 'desktop',
    ]"
  >
    <div class="w-full relative">
      <RaceHeader />
    </div>

    <div :class="[stickyChart && 'sticky top-0 z-40']">
      <Card>
        <template #title>
          <div class="flex justify-between">
            <div>Profil de la course</div>
            <div class="flex gap-2">
              <RaceAutomaticPace v-if="editableMode" />
              <RaceChartParams />
            </div>
          </div>
        </template>
        <template #content>
          <div class="h-[250px] md:h-[450px] relative">
            <RaceChart />
          </div>
        </template>
      </Card>
    </div>

    <Card class="mt-8">
      <template #title>
        <div class="flex justify-between">
          <div>Tableau des splits</div>
          <div>
            <SwitchToggle label="Mode édition" v-model="editableMode" />
          </div>
        </div>
      </template>
      <template #content>
        <div id="splits">
          <RaceSplits />
        </div>
      </template>
    </Card>
  </div>
  <div v-else class="flex justify-center items-center h-40 text-gray-500">
    <ProgressSpinner />
  </div>
  <RaceRecapChartModal />
  <RaceRecapTableModal />
</template>

<script setup lang="ts">
import SwitchToggle from '@/ui/components/inputs/SwitchToggle.vue';
import { useRace } from '@/ui/composables/useRace';
import { useRaceChartParams } from '@/ui/composables/useRaceChartParams';
import { useStores } from '@/ui/composables/useStores';
import { useViewport } from '@/ui/composables/useViewport';
import RaceChart from '@/ui/pages/races/race/chart/RaceChart.vue';
import RaceHeader from '@/ui/pages/races/race/header/RaceHeader.vue';
import RaceAutomaticPace from '@/ui/pages/races/race/pace-simulator/RacePaceSimulator.vue';
import RaceChartParams from '@/ui/pages/races/race/RaceChartParams.vue';
import RaceRecapChartModal from '@/ui/pages/races/race/recap/RaceRecapChartModal.vue';
import RaceRecapTableModal from '@/ui/pages/races/race/recap/RaceRecapTableModal.vue';
import RaceSplits from '@/ui/pages/races/race/splits/RaceSplits.vue';
import { Card, ProgressSpinner } from 'primevue';
import { onMounted, watch } from 'vue';

const props = defineProps<{ id: string }>();
const stores = useStores();
const { race, initRace } = useRace();
const { stickyChart, editableMode } = useRaceChartParams();
const { isMobile } = useViewport();

const initComposables = async () => {
  if (!props.id) return;
  const raceData = stores.races_store.getById(props.id);
  if (!raceData) return;
  initRace(raceData);
};

onMounted(() => initComposables());

watch(
  () => props.id,
  () => initComposables()
);
</script>

<style lang="scss">
#race-table .p-datatable-table-container {
  overflow-x: unset !important;
  overflow-y: unset !important;
}

.sticky {
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
