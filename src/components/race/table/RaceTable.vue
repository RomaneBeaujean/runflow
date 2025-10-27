<template>
  <div id="race-table" class="table" :data-mobile="isMobile ? true : null">
    <!-- Header -->
    <div class="row header-row text-neutral-600" v-if="!isMobile">
      <div class="header"></div>
      <div class="header">Type</div>
      <div class="header border-l-1 border-gray-200">Distance</div>
      <div class="header">Dénivelé total</div>
      <div class="header border-l-1 border-gray-200">Split</div>
      <div class="header">Dénivelé split</div>
      <div class="header">Pente split</div>
      <div class="header">Allure / durée</div>
      <div class="header border-l-1 border-gray-200">Temps d'arrêt</div>
      <div class="header border-l-1 border-gray-200">Heure - Durée totale</div>
      <div class="header border-l-1 border-gray-200">Barrière horraire</div>
      <div class="header border-l-1 border-gray-200" v-if="editableMode"></div>
    </div>
    <!-- Rows -->
    <template v-if="!isMobile">
      <template v-for="row in rows" :key="row.id">
        <div
          class="row relative"
          :data-hovered="hoveredRow?.id == row.id ? true : null"
          @mouseenter="() => onRowMouseEnter(row)"
          @mouseleave="() => onRowMouseLeave()"
        >
          <RaceTableRow :row="row" />
        </div>
        <AddSeparator :initialdistance="row.distance + 1" />
      </template>
      <!-- <div
        v-for="row in rows"
        :key="row.id"
        class="row relative"
        :data-hovered="hoveredRow?.id == row.id ? true : null"
        @mouseenter="() => onRowMouseEnter(row)"
        @mouseleave="() => onRowMouseLeave()"
      >
        <RaceTableRow :row="row" />
      </div>
      <AddSeparator /> -->
    </template>
    <template v-else>
      <template v-for="row in rows">
        <RaceTableRowMobile :row="row" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import useRaceChartSplitHover from '@/composables/Race/useRaceChartSplitHover';
import { useRaceFilters } from '@/composables/Race/useRaceFilters';
import useRaceTableRows from '@/composables/Race/useRaceTableRows';
import { useViewport } from '@/composables/useViewport';
import { TableRowItem } from '@/types/TableRowItem';
import AddSeparator from '../AddSeparator.vue';
import RaceTableRow from './RaceTableRow.vue';
import RaceTableRowMobile from './RaceTableRowMobile.vue';

const { editableMode } = useRaceFilters();
const { isMobile } = useViewport();
const { rows, hoveredRow, getRowSplit } = useRaceTableRows();
const { hoveredSplit } = useRaceChartSplitHover();

const onRowMouseEnter = (row: TableRowItem) => {
  hoveredSplit.value = getRowSplit(row);
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

  &[data-mobile] {
    display: flex;
    flex-direction: column;
  }
}
.row {
  display: table-row;

  &[data-hovered] {
    background-color: var(--color-blue-50);
  }
}
</style>
