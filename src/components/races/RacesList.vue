<template>
  <div class="w-full max-w-[1000px] mx-auto">
    <div
      v-for="race in stores.races.races"
      :key="race.id"
      class="border-b-1 border-neutral-200 p-3 flex flex-row justify-between gap-2 hover:bg-blue-50 cursor-pointer"
      @click="goToCourse(race.id)"
    >
      <div class="flex flex-1 flex-col gap-2">
        <div class="text-base font-semibold">
          {{ race.name }}
        </div>
        <div
          class="text-xs text-neutral-600"
          v-if="race.date || race.startTime"
        >
          <span v-if="race.date"> Le {{ dateToFormatted(race.date) }} </span>
          <span v-if="race.startTime">
            à {{ dateToFormattedTime(race.startTime) }}
          </span>
        </div>
        <div class="flex gap-2 flex-wrap">
          <ColorTag color="primary"
            >{{ race.totalDistance }} <small>km</small></ColorTag
          >
          <ColorTag color="amber"
            >{{ race.totalElevation }}m <small>d+</small></ColorTag
          >
          <ColorTag
            v-if="race.totalDuration"
            color="green"
            icon="pi pi-stopwatch"
          >
            {{ minutesToFormattedDuration(race.totalDuration) }}
          </ColorTag>
          <ColorTag v-if="race.totalDuration" color="pink" icon="pi pi-bolt">
            {{
              getAveragePace(race.splits, race.separators, race.totalDistance)
            }}
            <small>min/km</small>
          </ColorTag>
        </div>
      </div>
      <div class="flex flex-row gap-1 justify-center items-center">
        <Button
          text
          severity="secondary"
          size="small"
          icon="pi pi-trash"
          aria-label="Delete"
          @click.capture="(e) => deleteCourse(e, race.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ColorTag from '@/components/tags/ColorTag.vue';
import { getAveragePace } from '@/lib/gpx/Metrics';
import {
  dateToFormatted,
  dateToFormattedTime,
  minutesToFormattedDuration,
} from '@/lib/time';
import { useInjection } from '@/lib/useInjection';
import type { AppStores } from '@/stores/AppLoader';
import { Button } from 'primevue';
import { useRouter } from 'vue-router';

const stores = useInjection<AppStores>('stores');
const router = useRouter();
const { deleteRace } = stores.races;

function goToCourse(id: string) {
  router.push(`/races/${id}`);
}

function deleteCourse(e: MouseEvent, id: string) {
  e.stopPropagation();
  deleteRace(id);
}
</script>

<style scoped lang="scss"></style>
