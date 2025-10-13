<template>
  <div v-if="race">
    <Breadcrumb :model="items" class="text-sm"> </Breadcrumb>

    <!-- Bloc info course -->
    <div class="flex items-center justify-between p-2">
      <!-- Affichage / Edition -->
      <div class="flex flex-1 flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <template v-if="!editing">
            <span class="font-semibold text-lg">{{ race.name }}</span>
          </template>
          <template v-else>
            <InputText v-model="editableName" class="w-full sm:w-auto" />
          </template>
        </div>

        <div>
          <template v-if="!editing">
            <span class="text-gray-600">{{ formattedDate }}</span>
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

        <div>
          <template v-if="!editing">
            <span class="text-gray-600">{{ formattedTime }}</span>
          </template>
          <template v-else>
            <InputTime
              :time="editableTime"
              @update="({ time }) => (editableTime = time)"
            />
          </template>
        </div>
      </div>

      <!-- Bouton édition / validation -->
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

        <Button
          icon="pi pi-download"
          label="Exporter"
          class="p-button-rounded p-button-text"
          @click="exportRace"
        />
      </div>
    </div>

    <div class="space-y-6">
      <Fieldset legend="Profil de la course">
        <RaceChart />
      </Fieldset>

      <Fieldset legend="Splits">
        <RaceTable />
      </Fieldset>
    </div>
  </div>

  <div v-else class="flex justify-center items-center h-40 text-gray-500">
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
import { useInjection } from '@/lib/useInjection';
import type { AppStores } from '@/stores/AppLoader';
import { computed, onMounted, ref, watch } from 'vue';

import RaceChart from '@/components/chart/RaceChart.vue';
import InputTime from '@/components/table/InputTime.vue';
import RaceTable from '@/components/table/RaceSplitsTable.vue';
import { useRace } from '@/composables/useRace';
import { Button, DatePicker, Fieldset, InputText } from 'primevue';
import Breadcrumb from 'primevue/breadcrumb';
import { MenuItem } from 'primevue/menuitem';
import ProgressSpinner from 'primevue/progressspinner';

// Mode édition
const editing = ref(false);
const editableName = ref('');
const editableDate = ref<Date | null>(null);
const editableTime = ref<Date | null>(null);

const props = defineProps<{ id: string }>();
const stores = useInjection<AppStores>('stores');
const { splits, separators, race, startTime, initRace } = useRace();

const items = ref<MenuItem[]>([]);

const initRaceComposable = async () => {
  if (!props.id) return;
  const raceData = stores.races.getRace(props.id);
  if (!raceData) return;
  initRace(raceData);
  items.value = [
    { label: 'Plans de course', url: '/races' },
    { label: race.value.name, disabled: true },
  ];
};

const startEditing = () => {
  if (!race.value) return;
  editing.value = true;
  editableName.value = race.value.name;
  editableDate.value = race.value.date ? new Date(race.value.date) : null;
  editableTime.value = startTime.value ? new Date(startTime.value) : null;
};

const cancelEdit = () => {
  editing.value = false;
};

const saveEdit = () => {
  if (!race.value) return;
  race.value.name = editableName.value;
  race.value.date = editableDate.value;
  startTime.value = editableTime.value;
  editing.value = false;

  stores.races.updateRace(race.value.id, {
    name: race.value.name,
    date: race.value.date,
    startTime: startTime.value,
  });
};

// Format affichage
const formattedDate = computed(() =>
  race.value?.date ? new Date(race.value.date).toLocaleDateString('fr-FR') : '-'
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
  const race = stores.races.getRace(props.id);
  if (!race) return;

  const json = JSON.stringify(race, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeName = (race.name || 'race')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]/g, '');

  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.runflow.json`;
  a.click();

  URL.revokeObjectURL(url);
};

onMounted(() => initRaceComposable());

watch(
  () => props.id,
  () => initRaceComposable()
);

watch(
  [splits, separators, startTime],
  () => {
    stores.races.updateRace(race.value.id, {
      separators: separators.value,
      splits: splits.value,
      startTime: startTime.value,
    });
  },
  { deep: true }
);
</script>

<style scoped></style>
