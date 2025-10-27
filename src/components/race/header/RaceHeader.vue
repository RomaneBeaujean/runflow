<template>
  <div class="flex flex-row justify-between p-3" v-if="race">
    <div class="flex flex-col flex-1 gap-2 min-w-0">
      <!-- RaceBreadcrumbs -->
      <RaceBreadcrumbs :race="race" v-if="!isMobile" />

      <!-- Race name -->
      <div class="flex min-w-0">
        <div v-if="!editing" class="flex flex-1 items-center min-w-0">
          <span class="font-semibold text-xl truncate block max-w-full">
            {{ props.race.name }}
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
        <RaceOptions />
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
import RaceOptions from '@/components/race/RaceOptions.vue';
import ColorTag from '@/components/tags/ColorTag.vue';
import { useRace } from '@/composables/Race/useRace';
import { useRaceMetrics } from '@/composables/Race/useRaceMetrics';
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

const props = defineProps<{ race: Race }>();
const editing = ref(false);
const editableName = ref('');
const editableDate = ref<Date | null>(null);
const editableTime = ref<Date | null>(null);

const startEditing = () => {
  if (!props.race) return;
  editing.value = true;
  editableName.value = props.race.name;
  editableDate.value = props.race.date ? new Date(props.race.date) : null;
  editableTime.value = startTime.value ? new Date(startTime.value) : null;
};

const cancelEdit = () => {
  editing.value = false;
};

const saveEdit = async () => {
  if (!props.race) return;
  const newRace = await stores.races.updateRace(props.race.id, {
    name: editableName.value,
    date: editableDate.value,
    startTime: editableTime.value,
  });
  race.value = new Race(newRace);
  editing.value = false;
};

const exportRace = () => {
  const race = stores.races.getRace(props.race.id);
  if (!race) return;

  const json = JSON.stringify(race, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeName = (props.race.name || 'race')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]/g, '');

  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.runflow.json`;
  a.click();

  URL.revokeObjectURL(url);
};
</script>

<style scoped lang="scss"></style>
