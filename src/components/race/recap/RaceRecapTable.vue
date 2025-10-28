<template>
  <div id="recap" class="bg-amber-500 inline-flex flex-col items-center">
    <div class="recap-header">
      <div class="text-xl flex justify-center font-bold p-2">
        {{ race.name }} - Récapitulatif
      </div>
      <div class="flex justify-center">
        <div class="flex flex-col gap-2 items-center justify-center">
          <!-- Date -->
          <div
            class="text-xs text-neutral-600"
            v-if="race.date || race.startTime"
          >
            <span v-if="race.date"> Le {{ dateToFormatted(race.date) }} </span>
            <span v-if="race.startTime">
              à {{ dateToFormattedTime(race.startTime) }}
            </span>
          </div>

          <div class="flex flex-wrap gap-2">
            <ColorTag color="primary"
              >{{ race.totalDistance }} <small>km</small></ColorTag
            >
            <ColorTag color="amber"
              >{{ race.totalElevation }}m <small>d+</small></ColorTag
            >
            <ColorTag color="deep-purple" icon="pi pi-bolt">
              Allure moyenne: {{ averagePace }} <small>min/km</small>
            </ColorTag>
            <ColorTag color="green" icon="pi pi-stopwatch">
              Durée totale: {{ totalDuration }}
            </ColorTag>
          </div>
        </div>
      </div>
    </div>
    <Divider />
    <div class="table">
      <div class="row header-row">
        <div class="header"></div>
        <div
          class="header border-l-1 border-gray-200"
          v-if="params.refuel"
        ></div>
        <div class="header border-l-1 border-gray-200">Distance</div>
        <div class="header" v-if="params.cumulElevation">D+ total</div>
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
        <div class="header" v-if="params.totalDuration">Temps écoulé</div>
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
              <ColorTag color="pink" icon="pi pi-cart-arrow-down"
                >Ravito</ColorTag
              >
            </span>
          </div>
          <!-- Distance -->
          <div class="cell border-l-1 border-gray-200 font-semibold">
            {{ split.distance }} <span class="xsmall">km</span>
          </div>
          <!-- Dénivelé cumulé positif -->
          <div class="cell" v-if="params.cumulElevation">
            <template v-if="idx !== 0">
              <ColorTag color="brown">
                <span class="xsmall">+</span>{{ split.cumulElevation }}
                <span class="xsmall">m</span>
              </ColorTag>
            </template>
          </div>
          <!-- Dénivelé cumulé négatif -->
          <div class="cell" v-if="params.cumulNegativeElevation">
            <template v-if="idx !== 0">
              <ColorTag color="brown">
                <span class="xsmall">-</span>{{ split.cumulNegativeElevation }}
                <span class="xsmall">m</span>
              </ColorTag>
            </template>
          </div>
          <!-- Longeur split -->
          <div class="cell border-l-1 border-gray-200">
            <div v-if="idx !== 0">
              <ColorTag color="primary" class="font-semibold">
                {{ split.splitDistance }} <span class="xsmall">km</span>
              </ColorTag>
            </div>
          </div>
          <!-- Dénivelé split positif -->
          <div class="cell" v-if="params.splitElevation">
            <template v-if="idx !== 0">
              <ColorTag color="amber">
                <span class="xsmall">+</span> {{ split.splitElevation }}
                <span class="xsmall">m</span>
              </ColorTag>
            </template>
          </div>
          <!-- Dénivelé split négatif -->
          <div class="cell" v-if="params.splitNegativeElevation">
            <template v-if="idx !== 0">
              <ColorTag color="amber">
                <span class="xsmall">-</span> {{ split.splitNegativeElevation }}
                <span class="xsmall">m</span>
              </ColorTag>
            </template>
          </div>
          <!-- Pente split -->
          <div class="cell" v-if="params.splitSlope">
            <template v-if="idx !== 0">
              <SlopeTag :slope="split.splitSlopePercent">
                {{ split.splitSlopePercent }} <span class="xsmall">%</span>
              </SlopeTag>
            </template>
          </div>
          <!-- Allure split -->
          <div class="cell" v-if="params.splitPace">
            <template v-if="idx !== 0">
              <ColorTag icon="pi pi-bolt" color="deep-purple">
                {{ split.splitPace }}
                <span class="xsmall">min/km</span>
              </ColorTag>
            </template>
          </div>
          <!-- Durée split -->
          <div class="cell" v-if="params.splitDuration">
            <template v-if="idx !== 0">
              <ColorTag icon="pi pi-stopwatch" color="green">
                {{ minutesToFormattedDuration(split.splitDuration) }}
              </ColorTag>
            </template>
          </div>
          <!-- Temps d'arrêt ravito -->
          <div
            class="cell border-l-1 border-gray-200"
            v-if="params.stopRefuelDuration"
          >
            <template v-if="idx !== 0">
              <ColorTag color="pink">
                {{ split.stopDuration }} <span class="xsmall">min</span>
              </ColorTag>
            </template>
          </div>
          <!-- Heure -->
          <div class="cell border-l-1 border-gray-200" v-if="params.time">
            <ColorTag
              icon="pi pi-clock"
              color="primary"
              class="mb-2"
              v-if="split.time"
            >
              {{ dateToFormattedTime(split.time) }}
            </ColorTag>
          </div>
          <!-- Temps écoulé -->
          <div class="cell" v-if="params.totalDuration">
            <template v-if="idx !== 0">
              <ColorTag icon="pi pi-stopwatch" color="green">
                {{ minutesToFormattedDuration(split.cumulDuration) }}
              </ColorTag>
            </template>
          </div>
          <!-- Barrière horraire heure-->
          <div
            class="cell border-l-1 border-gray-200 w-[24px]"
            v-if="params.timeBarrierTime"
          >
            <template v-if="idx !== 0">
              <ColorTag
                v-if="split.timeBarrier"
                icon="pi pi-clock"
                :color="split.timeBarrierValid ? 'bright-green' : 'red'"
              >
                {{ dateToFormattedTime(split.timeBarrier) }}
              </ColorTag>
            </template>
          </div>
          <!-- Barrière horraire durée-->
          <div
            class="cell border-l-1 border-gray-200 w-[24px]"
            v-if="params.timeBarrierDuration"
          >
            <template v-if="idx !== 0">
              <ColorTag
                v-if="split.timeBarrier"
                icon="pi pi-stopwatch"
                :color="split.timeBarrierValid ? 'bright-green' : 'red'"
              >
                {{ minutesToFormattedDuration(split.timeBarrierDuration) }}
              </ColorTag>
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
import {
  dateToFormatted,
  dateToFormattedTime,
  minutesToFormattedDuration,
} from '@/lib/time';
import { Divider } from 'primevue';
import { computed } from 'vue';

export interface RecapParams {
  cumulElevation: boolean;
  cumulNegativeElevation: boolean;
  time: boolean;
  totalDuration: boolean;
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

const props = defineProps<{ params: RecapParams }>();

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

<style scoped>
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

.row:nth-child(even) {
  background-color: #f7f7f7;
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
