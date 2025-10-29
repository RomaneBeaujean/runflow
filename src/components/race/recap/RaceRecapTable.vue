<template>
  <div id="recap" class="inline-flex flex-col items-center">
    <div class="table">
      <div class="row header-row">
        <div class="header">Distance</div>
        <div class="header" v-if="params.refuel">Ravitaillement</div>
        <div class="header" v-if="params.cumulElevation">D+ total</div>
        <div class="header" v-if="params.cumulNegativeElevation">D- total</div>
        <div class="header">Longueur split</div>
        <div class="header" v-if="params.splitElevation">D+ split</div>
        <div class="header" v-if="params.splitNegativeElevation">D- split</div>
        <div class="header" v-if="params.splitSlope">Pente split</div>
        <div class="header" v-if="params.splitPace">Allure split</div>
        <div class="header" v-if="params.splitDuration">Durée split</div>
        <div class="header" v-if="params.stopRefuelDuration">Temps d'arrêt</div>
        <div class="header" v-if="params.time">Heure</div>
        <div class="header">Temps écoulé</div>
        <div class="header" v-if="params.timeBarrierTime">
          Barrière horraire (heure)
        </div>
        <div class="header" v-if="params.timeBarrierDuration">
          Barrière horraire (temps écoulé)
        </div>
      </div>
      <template v-for="(split, idx) in splitItems" :key="split.id">
        <div class="row">
          <!-- Distance -->
          <div class="cell font-semibold">
            {{ split.distance }} <span class="xsmall">km</span>
          </div>
          <!-- Ravitaillement -->
          <div class="cell w-[24px]" v-if="params.refuel">
            <span v-if="split.refuel">
              <i class="pi pi-cart-arrow-down"></i>
            </span>
          </div>
          <!-- Dénivelé cumulé positif -->
          <div class="cell" v-if="params.cumulElevation">
            <span v-if="idx !== 0">
              +{{ split.cumulElevation }} <span class="xsmall">m</span>
            </span>
          </div>
          <!-- Dénivelé cumulé négatif -->
          <div class="cell" v-if="params.cumulNegativeElevation">
            <span v-if="idx !== 0">
              -{{ split.cumulNegativeElevation }} <span class="xsmall">m</span>
            </span>
          </div>
          <!-- Longeur split -->
          <div class="cell">
            <span v-if="idx !== 0"
              >{{ split.splitDistance }} <span class="xsmall">km</span></span
            >
          </div>
          <!-- Dénivelé split positif -->
          <div class="cell" v-if="params.splitElevation">
            <span v-if="idx !== 0">
              + {{ split.splitElevation }} <span class="xsmall">m</span>
            </span>
          </div>
          <!-- Dénivelé split négatif -->
          <div class="cell" v-if="params.splitNegativeElevation">
            <span v-if="idx !== 0">
              -{{ split.splitNegativeElevation }} <span class="xsmall">m</span>
            </span>
          </div>
          <!-- Pente split -->
          <div class="cell" v-if="params.splitSlope">
            <span v-if="idx !== 0">
              {{ split.splitSlopePercent }} <span class="xsmall">%</span>
            </span>
          </div>
          <!-- Allure split -->
          <div class="cell" v-if="params.splitPace">
            <span v-if="idx !== 0">
              {{ split.splitPace }}
              <span class="xsmall">min/km</span>
            </span>
          </div>
          <!-- Durée split -->
          <div class="cell" v-if="params.splitDuration">
            <span v-if="idx !== 0">
              {{ minutesToFormattedDuration(split.splitDuration) }}
            </span>
          </div>
          <!-- Temps d'arrêt ravito -->
          <div class="cell" v-if="params.stopRefuelDuration">
            <span v-if="idx !== 0 && split.stopDuration > 0">
              {{ split.stopDuration }} <span class="xsmall">min</span>
            </span>
          </div>
          <!-- Heure -->
          <div class="cell" v-if="params.time">
            <span v-if="split.time">
              {{ dateToFormattedTime(split.time) }}
            </span>
          </div>
          <!-- Temps écoulé -->
          <div class="cell">
            <span v-if="idx !== 0">
              {{ minutesToFormattedDuration(split.cumulDuration) }}
            </span>
          </div>
          <!-- Barrière horraire heure-->
          <div class="cell w-[24px]" v-if="params.timeBarrierTime">
            <span v-if="idx !== 0 && split.timeBarrier">
              {{ dateToFormattedTime(split.timeBarrier) }}
            </span>
          </div>
          <!-- Barrière horraire durée-->
          <div class="cell w-[24px]" v-if="params.timeBarrierDuration">
            <span v-if="idx !== 0 && split.timeBarrier">
              {{ minutesToFormattedDuration(split.timeBarrierDuration) }}
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import useRaceSplits from '@/composables/Race/useRaceSplits';
import { dateToFormattedTime, minutesToFormattedDuration } from '@/lib/time';

export interface RecapParams {
  cumulElevation: boolean;
  cumulNegativeElevation: boolean;
  time: boolean;
  refuel: boolean;
  stopRefuelDuration: boolean;
  timeBarrierTime: boolean;
  timeBarrierDuration: boolean;
  splitElevation: boolean;
  splitNegativeElevation: boolean;
  splitSlope: boolean;
  splitPace: boolean;
  splitDuration: boolean;
}

const props = defineProps<{
  params: RecapParams;
}>();

const { splitItems } = useRaceSplits();
</script>

<style scoped lang="scss">
#recap {
  background: white;
  padding: 8px;
  font-size: 12px;
}

.table {
  display: table;
  border-collapse: collapse;
  table-layout: auto;
  border-collapse: collapse;
  width: max-content; /* optionnel, et très utile */
}

.header {
  display: table-cell;
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;
  vertical-align: middle;
  text-align: center;
  font-size: 12px;
  font-weight: 800;
}

.row {
  display: table-row;
}

.cell {
  display: table-cell;
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;
  vertical-align: middle;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}

.xsmall {
  font-size: 10px;
}
</style>
