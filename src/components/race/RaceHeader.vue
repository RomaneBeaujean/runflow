<template>
  <div class="flex flex-col gap-2 mb-4">
    <div class="flex justify-between items-center">
      <RaceBreadcrumbs :race="race" />

      <div class="buttons flex flex-row">
        <Button
          icon="pi pi-file-export"
          class="p-button-rounded p-button-text"
          :icon-class="'text-xs'"
          @click="exportRace"
        />
        <div>
          <Button
            v-if="!editing"
            icon="pi pi-pencil"
            class="p-button-rounded p-button-text"
            @click="startEditing"
          />
          <div v-else class="flex gap-2">
            <Button
              icon="pi pi-check"
              class="p-button-rounded"
              @click="saveEdit"
            />
            <Button
              icon="pi pi-times"
              class="p-button-rounded"
              @click="cancelEdit"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="ml-3">
      <template v-if="!editing">
        <span class="font-semibold text-xl block truncate">{{
          props.race.name
        }}</span>
      </template>
      <template v-else>
        <InputText v-model="editableName" class="w-full sm:w-auto" />
      </template>
    </div>
  </div>

  <!-- Infos course -->
  <div
    class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 pt-0"
  >
    <!-- Date -->
    <div>
      <template v-if="!editing">
        <ColorTag color="neutral" size="medium" icon="pi pi-calendar">
          {{ formattedDate }}
        </ColorTag>
      </template>
      <template v-else>
        <DatePicker
          v-model="editableDate"
          locale="fr"
          dateFormat="dd-mm-yy"
          showIcon
        />
      </template>
    </div>

    <!-- Heure départ -->
    <div>
      <template v-if="!editing">
        <ColorTag color="primary" size="medium" icon="pi pi-calendar-clock">
          Départ: {{ formattedTime }}
        </ColorTag>
      </template>
      <template v-else>
        <InputTime
          :time="editableTime"
          @update="({ time }) => (editableTime = time)"
        />
      </template>
    </div>

    <!-- Allure moyenne -->
    <div class="flex-shrink-0">
      <template v-if="!editing">
        <ColorTag color="deep-purple" size="medium" icon="pi pi-bolt">
          Allure moyenne: {{ averagePace }} <small>min/km</small>
        </ColorTag>
      </template>
    </div>

    <!-- Durée totale -->
    <div class="flex-shrink-0">
      <template v-if="!editing">
        <ColorTag color="green" size="medium" icon="pi pi-stopwatch">
          Durée totale: {{ totalDuration }}
        </ColorTag>
      </template>
    </div>
  </div>

  <div class="flex items-center gap-2 justify-center flex-1 p-5">
    <ToggleSwitch v-model="sticky" />
    <div
      class="text-xs cursor-pointer font-semibold text-primary-800"
      @click="sticky = !sticky"
    >
      Activer l'ancrage du graphique
    </div>
  </div>
</template>

<script setup lang="ts">
import InputTime from '@/components/race/inputs/InputTime.vue';
import { useGpxMetrics } from '@/composables/useGpxMetrics';
import { useRace } from '@/composables/useRace';
import { useRaceFilters } from '@/composables/useRaceFilters';
import { minutesToFormattedDuration } from '@/lib/time';
import { useInjection } from '@/lib/useInjection';
import { AppStores } from '@/stores/AppLoader';
import { Race } from '@/types/entities/Race';
import { Button, DatePicker, InputText, ToggleSwitch } from 'primevue';
import { computed, ref } from 'vue';
import ColorTag from '../ColorTag.vue';
import RaceBreadcrumbs from './RaceBreadcrumbs.vue';

const stores = useInjection<AppStores>('stores');

const { race, startTime, splits, totalDistance } = useRace();
const { getAveragePace, getCumulDurationToDistance } = useGpxMetrics();
const { sticky } = useRaceFilters();

const averagePace = computed(() => {
  if (!splits.value.length) return;
  return getAveragePace(splits.value);
});

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

const saveEdit = () => {
  if (!props.race) return;
  stores.races.updateRace(props.race.id, {
    name: editableName.value,
    date: editableDate.value,
    startTime: editableTime.value,
  });

  editing.value = false;
};

// Format affichage
const formattedDate = computed(() =>
  props.race?.date ? new Date(props.race.date).toLocaleDateString('fr-FR') : '-'
);
const formattedTime = computed(() =>
  startTime.value
    ? new Date(startTime.value).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-'
);

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
