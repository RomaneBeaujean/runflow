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
import RaceChart from '@/components/race/chart/RaceChart.vue';
import RaceHeader from '@/components/race/header/RaceHeader.vue';
import RaceAutomaticPace from '@/components/race/pace-simulator/RacePaceSimulator.vue';
import RaceChartParams from '@/components/race/RaceChartParams.vue';
import RaceRecapChartModal from '@/components/race/recap/RaceRecapChartModal.vue';
import RaceRecapTableModal from '@/components/race/recap/RaceRecapTableModal.vue';
import RaceSplits from '@/components/race/splits/RaceSplits.vue';
import SwitchToggle from '@/components/SwitchToggle.vue';
import { useRace } from '@/composables/useRace';
import { useRaceChartParams } from '@/composables/useRaceChartParams';
import { useStores } from '@/composables/useStores';
import { useViewport } from '@/composables/useViewport';
import { Card, ProgressSpinner } from 'primevue';
import { onMounted, watch } from 'vue';

const props = defineProps<{ id: string }>();
const stores = useStores();
const { race, initRace } = useRace();
const { stickyChart, editableMode } = useRaceChartParams();
const { isMobile } = useViewport();

const initComposables = async () => {
  if (!props.id) return;
  const raceData = stores.races.getRace(props.id);
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
