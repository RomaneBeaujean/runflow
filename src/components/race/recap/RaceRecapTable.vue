<template>
  <div
    id="recap"
    class="inline-flex flex-col items-center"
    :data-color="print === 'color'"
  >
    <div class="table">
      <div class="row header-row">
        <div class="header"></div>
        <div
          class="header border-l-1 border-gray-200"
          v-if="params.refuel"
        ></div>
        <div class="header border-l-1 border-gray-200">Distance</div>
        <div
          class="header border-l-1 border-gray-200"
          v-if="params.cumulElevation"
        >
          D+ total
        </div>
        <div class="header" v-if="params.cumulNegativeElevation">D- total</div>
        <div class="header border-l-1 border-gray-200">Longueur split</div>
        <div class="header" v-if="params.splitElevation">D+ split</div>
        <div class="header" v-if="params.splitNegativeElevation">D- split</div>
        <div class="header" v-if="params.splitSlope">Pente split</div>
        <div class="header" v-if="params.splitPace">Allure split</div>
        <div class="header" v-if="params.splitDuration">Durée split</div>
        <div
          class="header border-l-1 border-gray-200"
          v-if="params.stopRefuelDuration"
        >
          Temps d'arrêt
        </div>
        <div class="header border-l-1 border-gray-200" v-if="params.time">
          Heure
        </div>
        <div class="header">Temps écoulé</div>
        <div
          class="header border-l-1 border-gray-200"
          v-if="params.timeBarrierTime"
        >
          Barrière horraire (heure)
        </div>
        <div
          class="header border-l-1 border-gray-200"
          v-if="params.timeBarrierDuration"
        >
          Barrière horraire (temps écoulé)
        </div>
      </div>
      <template v-for="(split, idx) in splitItems" :key="split.id">
        <div class="row">
          <!-- Split numéro -->
          <div class="cell">
            <span v-if="idx !== 0" class="xsmall"> #{{ split.index }} </span>
            <span v-else class="xsmall"> Départ </span>
          </div>
          <!-- Ravitaillement -->
          <div
            class="cell w-[24px] border-l-1 border-gray-200"
            v-if="params.refuel"
          >
            <span v-if="split.refuel">
              <ColorTag
                color="pink"
                icon="pi pi-cart-arrow-down"
                v-if="print === 'color'"
                >Ravitaillement</ColorTag
              >
              <span v-else class="text-xs font-bold">Ravitaillement</span>
            </span>
          </div>
          <!-- Distance -->
          <div class="cell border-l-1 border-gray-200 font-semibold">
            {{ split.distance }} <span class="xsmall">km</span>
          </div>
          <!-- Dénivelé cumulé positif -->
          <div
            class="cell border-l-1 border-gray-200"
            v-if="params.cumulElevation"
          >
            <template v-if="idx !== 0">
              <ColorTag color="brown" v-if="print === 'color'">
                <span class="xsmall">+</span>{{ split.cumulElevation }}
                <span class="xsmall">m</span>
              </ColorTag>
              <span v-else>
                <span class="xsmall">+</span>{{ split.cumulElevation }}
                <span class="xsmall">m</span>
              </span>
            </template>
          </div>
          <!-- Dénivelé cumulé négatif -->
          <div class="cell" v-if="params.cumulNegativeElevation">
            <template v-if="idx !== 0">
              <ColorTag color="brown" v-if="print === 'color'">
                <span class="xsmall">-</span>{{ split.cumulNegativeElevation }}
                <span class="xsmall">m</span>
              </ColorTag>
              <span v-else>
                <span class="xsmall">-</span>{{ split.cumulNegativeElevation }}
                <span class="xsmall">m</span>
              </span>
            </template>
          </div>
          <!-- Longeur split -->
          <div class="cell border-l-1 border-gray-200">
            <div v-if="idx !== 0">
              <ColorTag
                color="primary"
                class="font-semibold"
                v-if="print === 'color'"
              >
                {{ split.splitDistance }} <span class="xsmall">km</span>
              </ColorTag>
              <span v-else class="font-semibold">
                {{ split.splitDistance }} <span class="xsmall">km</span>
              </span>
            </div>
          </div>
          <!-- Dénivelé split positif -->
          <div class="cell" v-if="params.splitElevation">
            <template v-if="idx !== 0">
              <ColorTag color="amber" v-if="print === 'color'">
                <span class="xsmall">+</span> {{ split.splitElevation }}
                <span class="xsmall">m</span>
              </ColorTag>
              <span v-else>
                <span class="xsmall">+</span> {{ split.splitElevation }}
                <span class="xsmall">m</span>
              </span>
            </template>
          </div>
          <!-- Dénivelé split négatif -->
          <div class="cell" v-if="params.splitNegativeElevation">
            <template v-if="idx !== 0">
              <ColorTag color="amber" v-if="print === 'color'">
                <span class="xsmall">-</span> {{ split.splitNegativeElevation }}
                <span class="xsmall">m</span>
              </ColorTag>
              <span v-else>
                <span class="xsmall">-</span> {{ split.splitNegativeElevation }}
                <span class="xsmall">m</span>
              </span>
            </template>
          </div>
          <!-- Pente split -->
          <div class="cell" v-if="params.splitSlope">
            <template v-if="idx !== 0">
              <SlopeTag
                :slope="split.splitSlopePercent"
                v-if="print === 'color'"
              >
                {{ split.splitSlopePercent }} <span class="xsmall">%</span>
              </SlopeTag>
              <span v-else>
                {{ split.splitSlopePercent }} <span class="xsmall">%</span>
              </span>
            </template>
          </div>
          <!-- Allure split -->
          <div class="cell" v-if="params.splitPace">
            <template v-if="idx !== 0">
              <ColorTag
                icon="pi pi-bolt"
                color="deep-purple"
                v-if="print === 'color'"
              >
                {{ split.splitPace }}
                <span class="xsmall">min/km</span>
              </ColorTag>
              <span v-else>
                {{ split.splitPace }}
                <span class="xsmall">min/km</span>
              </span>
            </template>
          </div>
          <!-- Durée split -->
          <div class="cell" v-if="params.splitDuration">
            <template v-if="idx !== 0">
              <ColorTag
                icon="pi pi-stopwatch"
                color="green"
                v-if="print === 'color'"
              >
                {{ minutesToFormattedDuration(split.splitDuration) }}
              </ColorTag>
              <span v-else>
                {{ minutesToFormattedDuration(split.splitDuration) }}
              </span>
            </template>
          </div>
          <!-- Temps d'arrêt ravito -->
          <div
            class="cell border-l-1 border-gray-200"
            v-if="params.stopRefuelDuration"
          >
            <template v-if="idx !== 0 && split.stopDuration > 0">
              <ColorTag color="pink" v-if="print === 'color'">
                {{ split.stopDuration }} <span class="xsmall">min</span>
              </ColorTag>
              <span v-else>
                {{ split.stopDuration }} <span class="xsmall">min</span>
              </span>
            </template>
          </div>
          <!-- Heure -->
          <div class="cell border-l-1 border-gray-200" v-if="params.time">
            <template v-if="split.time">
              <ColorTag
                icon="pi pi-clock"
                color="primary"
                class="mb-2"
                v-if="print === 'color'"
              >
                {{ dateToFormattedTime(split.time) }}
              </ColorTag>
              <span v-else>
                {{ dateToFormattedTime(split.time) }}
              </span>
            </template>
          </div>
          <!-- Temps écoulé -->
          <div class="cell">
            <template v-if="idx !== 0">
              <ColorTag
                icon="pi pi-stopwatch"
                color="green"
                v-if="print === 'color'"
              >
                {{ minutesToFormattedDuration(split.cumulDuration) }}
              </ColorTag>
              <span v-else>
                {{ minutesToFormattedDuration(split.cumulDuration) }}
              </span>
            </template>
          </div>
          <!-- Barrière horraire heure-->
          <div
            class="cell border-l-1 border-gray-200 w-[24px]"
            v-if="params.timeBarrierTime"
          >
            <template v-if="idx !== 0 && split.timeBarrier">
              <ColorTag
                v-if="print === 'color'"
                icon="pi pi-clock"
                :color="split.timeBarrierValid ? 'bright-green' : 'red'"
              >
                {{ dateToFormattedTime(split.timeBarrier) }}
              </ColorTag>
              <span v-else>
                {{ dateToFormattedTime(split.timeBarrier) }}
              </span>
            </template>
          </div>
          <!-- Barrière horraire durée-->
          <div
            class="cell border-l-1 border-gray-200 w-[24px]"
            v-if="params.timeBarrierDuration"
          >
            <template v-if="idx !== 0 && split.timeBarrier">
              <ColorTag
                v-if="print === 'color'"
                icon="pi pi-stopwatch"
                :color="split.timeBarrierValid ? 'bright-green' : 'red'"
              >
                {{ minutesToFormattedDuration(split.timeBarrierDuration) }}
              </ColorTag>
              <span v-else>
                {{ minutesToFormattedDuration(split.timeBarrierDuration) }}
              </span>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import ColorTag from '@/components/tags/ColorTag.vue';
import SlopeTag from '@/components/tags/SlopeTag.vue';
import { useRace } from '@/composables/Race/useRace';
import { useRaceMetrics } from '@/composables/Race/useRaceMetrics';
import useRaceSplits from '@/composables/Race/useRaceSplits';
import { dateToFormattedTime, minutesToFormattedDuration } from '@/lib/time';
import { computed } from 'vue';

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
  print: 'color' | 'excel' | 'black';
}>();

const { averagePace, getCumulDurationToDistance } = useRaceMetrics();
const { race, splits, totalDistance } = useRace();
const { splitItems } = useRaceSplits();

const totalDuration = computed(() => {
  if (!splits.value.length) return;
  return minutesToFormattedDuration(
    getCumulDurationToDistance(totalDistance.value)
  );
});
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
  vertical-align: middle;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
}

.row {
  display: table-row;
}

#recap [data-color] {
  .row:nth-child(even) {
    background-color: #f7f7f7;
  }
}

.cell {
  display: table-cell;
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
  vertical-align: middle;
  text-align: center;
  font-size: 14px;
}

.xsmall {
  font-size: 10px;
}
</style>
