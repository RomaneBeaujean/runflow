<template>
  <div :class="isMobile ? 'flex flex-col' : 'table'">
    <template v-if="!isMobile">
      <!-- Table Header -->
      <div class="row header-row text-neutral-600">
        <div class="header"></div>
        <div class="header"></div>
        <div class="header border-l-1 border-gray-200">Distance totale</div>
        <div class="header">Dénivelé total</div>
        <div class="header border-l-1 border-gray-200">Split</div>
        <div class="header">Dénivelé split</div>
        <div class="header">Pente split</div>
        <div class="header">Allure / durée du split</div>
        <!-- <div class="header border-l-1 border-gray-200">Nutrition</div> -->
        <div class="header border-l-1 border-gray-200">Temps d'arrêt</div>
        <div class="header border-l-1 border-gray-200">Temps écoulé</div>
        <div class="header">Heure</div>
        <div class="header">Barrière horraire (heure)</div>
        <div
          class="header border-l-1 border-gray-200"
          v-if="editableMode"
        ></div>
      </div>

      <!-- Table Body -->
      <template v-for="split in splitItems" :key="split.id">
        <div
          class="row relative"
          :data-hovered="hoveredSplitItem?.id == split.id ? true : null"
          @mouseenter="() => onRowMouseEnter(split)"
          @mouseleave="() => onRowMouseLeave()"
        >
          <RaceSplitDesktop :split="split" />
        </div>
        <AddSeparator v-if="editableMode" />
      </template>
    </template>
    <template v-else>
      <template v-for="split in splitItems">
        <RaceSplitMobile :split="split" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import AddSeparator from '@/components/race/AddSeparator.vue';
import RaceSplitDesktop from '@/components/race/splits/RaceSplitDesktop.vue';
import RaceSplitMobile from '@/components/race/splits/RaceSplitMobile.vue';
import { useRaceChartParams } from '@/composables/useRaceChartParams';
import useRaceChartSplitHover from '@/composables/useRaceChartSplitHover';
import useRaceSplits from '@/composables/useRaceSplits';
import { useViewport } from '@/composables/useViewport';
import { SplitItem } from '@/types/SplitItem';

const { editableMode } = useRaceChartParams();
const { isMobile } = useViewport();
const { splitItems, hoveredSplitItem, getItemSplit } = useRaceSplits();
const { hoveredSplit } = useRaceChartSplitHover();

const onRowMouseEnter = (row: SplitItem) => {
  hoveredSplit.value = getItemSplit(row);
};

const onRowMouseLeave = () => {
  hoveredSplit.value = null;
};
</script>
<style lang="scss" scoped>
.header {
  display: table-cell;
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
  vertical-align: middle;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
}

.table {
  display: table;
  width: 100%;
  border-collapse: collapse;
}

.row {
  display: table-row;

  &[data-hovered] {
    background-color: var(--color-blue-50);
  }
}
</style>
