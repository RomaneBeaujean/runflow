<template>
  <template v-if="race">
    <div class="flex md:flex-row flex-col p-3 relative">
      <div class="flex-1 flex flex-col">
        <div class="flex justify-center">
          <RaceBreadcrumbs :race="race" />
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex justify-center gap-2 min-w-0">
            <div
              v-if="!editing"
              class="flex justify-center items-center min-w-0"
            >
              <span class="text-4xl p-3 truncate block max-w-full title-font">
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
          <div class="flex flex-col gap-2 items-center">
            <div
              class="text-xs md:text-sm text-neutral-600 pb-3"
              v-if="(race.date || race.startTime) && !editing"
            >
              <span v-if="race.date">
                Le {{ dateToFormatted(race.date) }}
              </span>
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

            <div class="flex flex-wrap gap-2 justify-center">
              <ColorTag color="primary"
                >{{ totalDistance }} <small>km</small></ColorTag
              >
              <ColorTag color="amber"
                >{{ race.totalElevation }}m <small>d+</small></ColorTag
              >
              <ColorTag color="green" icon="pi pi-stopwatch">
                Durée prévue: {{ totalDuration }}
              </ColorTag>
              <ColorTag color="deep-purple" icon="pi pi-bolt">
                Allure moyenne: {{ averagePace }} <small>min/km</small>
              </ColorTag>
            </div>
          </div>
        </div>
      </div>
      <div class="absolute right-0 mt-[5px]">
        <div v-if="!editing" class="flex flex-row flex-0">
          <RaceEllipsisMenu :race="race" :edit="startEditing" />
        </div>
        <div v-if="editing" class="flex gap-1">
          <Button icon="pi pi-check" rounded @click="saveEdit" />
          <Button icon="pi pi-times" rounded @click="cancelEdit" />
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import {
  dateToFormatted,
  dateToFormattedTime,
  minutesToFormattedDuration,
} from '@/domain/helpers/Time.helper';
import { Race } from '@/domain/types/Race';
import InputTime from '@/ui/components/inputs/InputTime.vue';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import { useRace } from '@/ui/composables/useRace';
import { useRaceMetrics } from '@/ui/composables/useRaceMetrics';
import { useStores } from '@/ui/composables/useStores';
import RaceEllipsisMenu from '@/ui/pages/races/race/header/RaceEllipsisMenu.vue';
import { Button, DatePicker, InputText } from 'primevue';
import { computed, ref } from 'vue';
import RaceBreadcrumbs from './RaceBreadcrumbs.vue';

const stores = useStores();
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
  const newRace = await stores.races_store.updateById(race.value.id, {
    name: editableName.value,
    date: editableDate.value,
    startTime: editableTime.value,
  });
  race.value = new Race(newRace);
  editing.value = false;
};
</script>

<style scoped lang="scss"></style>
