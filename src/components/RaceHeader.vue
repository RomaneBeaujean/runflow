<template>
  <div class="flex items-center">
    <div class="flex-1">
      <RaceBreadcrumbs :race="race" />
    </div>
    <div>
      <Button
        icon="pi pi-file-export"
        label="Exporter"
        class="p-button-rounded p-button-text text-xs px-2 py-1"
        :icon-class="'text-xs'"
        @click="exportRace"
      />
    </div>
  </div>
  <div class="flex items-center mb-4">
    <div class="flex flex-1 items-center gap-6 p-3">
      <div>
        <template v-if="!editing">
          <span class="font-semibold text-xl">{{ props.race.name }}</span>
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
    <div>
      <Button
        v-if="!editing"
        icon="pi pi-pencil"
        class="p-button-rounded p-button-text"
        @click="startEditing"
      />
      <div v-else class="flex gap-2">
        <Button icon="pi pi-check" class="p-button-rounded" @click="saveEdit" />
        <Button
          icon="pi pi-times"
          class="p-button-rounded"
          @click="cancelEdit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRace } from '@/composables/useRace';
import { useInjection } from '@/lib/useInjection';
import { AppStores } from '@/stores/AppLoader';
import { Race } from '@/types/entities/Race';
import { Button, DatePicker, InputText } from 'primevue';
import { computed, ref } from 'vue';
import InputTime from './InputTime.vue';
import RaceBreadcrumbs from './RaceBreadcrumbs.vue';

const stores = useInjection<AppStores>('stores');
const { race, startTime } = useRace();

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
  props.race.name = editableName.value;
  props.race.date = editableDate.value;
  startTime.value = editableTime.value;
  editing.value = false;

  stores.races.updateRace(props.race.id, {
    name: props.race.name,
    date: props.race.date,
    startTime: startTime.value,
  });
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
