<template>
  <div class="flex flex-row justify-between p-3" v-if="race">
    <div class="flex flex-col flex-1 gap-2 min-w-0">
      <!-- RaceBreadcrumbs -->
      <RaceBreadcrumbs :race="race" v-if="!isMobile" />

      <!-- Race name -->
      <div class="flex min-w-0">
        <div v-if="!editing" class="flex flex-1 items-center min-w-0">
          <span class="font-semibold text-xl truncate block max-w-full">
            {{ race.name }}
          </span>
        </div>
        <div v-else>
          <InputText
            v-model="editableName"
            class="w-full sm:w-auto"
            placeholder="Nom du plan"
          />
        </div>
      </div>

      <!-- Infos course -->
      <div class="flex flex-col gap-2">
        <!-- Date -->
        <div
          class="text-xs text-neutral-600"
          v-if="(race.date || race.startTime) && !editing"
        >
          <span v-if="race.date"> Le {{ dateToFormatted(race.date) }} </span>
          <span v-if="race.startTime">
            à {{ dateToFormattedTime(race.startTime) }}
          </span>
        </div>
        <div v-if="editing" class="flex flex-wrap gap-2">
          <DatePicker
            v-model="editableDate"
            locale="fr"
            dateFormat="dd/mm/yy"
            showIcon
            placeholder="Date"
          />
          <InputTime
            :time="editableTime"
            @update="({ time }) => (editableTime = time)"
          />
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

    <!-- Boutons -->
    <div class="flex-0">
      <div v-if="!editing" class="flex flex-row">
        <RaceViewParams />
        <RaceEllipsisMenu :race="race" :edit="startEditing" />
      </div>
      <div v-if="editing" class="flex gap-1">
        <Button icon="pi pi-check" rounded @click="saveEdit" />
        <Button icon="pi pi-times" rounded @click="cancelEdit" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RaceBreadcrumbs from '@/components/race/header/RaceBreadcrumbs.vue';
import RaceEllipsisMenu from '@/components/race/header/RaceEllipsisMenu.vue';
import InputTime from '@/components/race/inputs/InputTime.vue';
import RaceViewParams from '@/components/race/RaceViewParams.vue';
import ColorTag from '@/components/tags/ColorTag.vue';
import { useRace } from '@/composables/race/useRace';
import { useRaceMetrics } from '@/composables/race/useRaceMetrics';
import { useViewport } from '@/composables/useViewport';
import {
  dateToFormatted,
  dateToFormattedTime,
  minutesToFormattedDuration,
} from '@/lib/time';
import { useInjection } from '@/lib/useInjection';
import { AppStores } from '@/stores/AppLoader';
import { Race } from '@/types/entities/Race';
import { Button, DatePicker, InputText } from 'primevue';
import { computed, ref } from 'vue';

const stores = useInjection<AppStores>('stores');
const { isMobile } = useViewport();
const { race, startTime, splits, totalDistance } = useRace();
const { averagePace, getCumulDurationToDistance } = useRaceMetrics();

const totalDuration = computed(() => {
  if (!splits.value.length) return;
  return minutesToFormattedDuration(
    getCumulDurationToDistance(totalDistance.value)
  );
});

const editing = ref(false);
const editableName = ref('');
const editableDate = ref<Date | null>(null);
const editableTime = ref<Date | null>(null);

const startEditing = () => {
  if (!race) return;
  editing.value = true;
  editableName.value = race.value.name;
  editableDate.value = race.value.date ? new Date(race.value.date) : null;
  editableTime.value = startTime.value ? new Date(startTime.value) : null;
};

const cancelEdit = () => {
  editing.value = false;
};

const saveEdit = async () => {
  if (!race.value) return;
  const newRace = await stores.races.updateRace(race.value.id, {
    name: editableName.value,
    date: editableDate.value,
    startTime: editableTime.value,
  });
  race.value = new Race(newRace);
  editing.value = false;
};
</script>

<style scoped lang="scss"></style>
