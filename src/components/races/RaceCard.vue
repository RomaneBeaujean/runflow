<template>
  <Card
    class="flex-1 race-card hover:cursor-pointer"
    @click="goToCourse(race.id)"
  >
    <template #title>
      <div class="full-w">
        <div class="overflow-hidden text-ellipsis whitespace-nowrap">
          {{ race.name }}
        </div>
      </div>
    </template>
    <template #subtitle>
      <template v-if="race.date || race.startTime">
        <span v-if="race.date"> Le {{ dateToFormatted(race.date) }} </span>
        <span v-if="race.startTime">
          à {{ dateToFormattedTime(race.startTime) }}
        </span>
      </template>
      <template v-else>
        <span>&nbsp;</span>
      </template>
    </template>
    <template #content>
      <div class="full-w full-h relative">
        <div class="flex flex-col gap-2">
          <div class="flex gap-2">
            <ColorTag color="primary"
              >{{ race.totalDistance }} <small>km</small></ColorTag
            >
            <ColorTag color="amber"
              >{{ race.totalElevation }}m <small>d+</small></ColorTag
            >
          </div>
          <div class="flex gap-2">
            <ColorTag
              v-if="race.totalDuration"
              color="green"
              icon="pi pi-stopwatch"
            >
              {{ minutesToFormattedDuration(race.totalDuration) }}
            </ColorTag>
            <ColorTag v-if="race.totalDuration" color="pink" icon="pi pi-bolt">
              {{ getAveragePace(race.splits, race.separators) }}
              <small>min/km</small>
            </ColorTag>
          </div>
        </div>
        <div class="absolute bottom-0 right-0 flex gap-2">
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
    </template>
  </Card>
</template>

<script setup lang="ts">
import { useStores } from '@/composables/useStores';
import { getAveragePace } from '@/lib/gpx/Metrics';
import {
  dateToFormatted,
  dateToFormattedTime,
  minutesToFormattedDuration,
} from '@/lib/time';
import { Race } from '@/types/entities/Race';
import { Button, Card } from 'primevue';
import { useRouter } from 'vue-router';
import ColorTag from '../tags/ColorTag.vue';

const stores = useStores();
const props = defineProps<{ race: Race }>();
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

<style scoped lang="scss">
.race-card:hover {
  background: var(--color-gray-50);
}
</style>
