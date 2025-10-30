<template>
  <div class="p-5 w-full max-w-[700px] mx-auto">
    <Panel toggleable v-model:collapsed="collapsed">
      <template #header>
        <div
          class="flex flex-row flex-1 w-full h-full cursor-pointer"
          @click="collapsed = !collapsed"
        >
          <div class="flex items-center gap-2 cursor-pointer">
            <i class="pi pi-chart-bar"></i>
            <span class="font-bold">Ajouter un plan de course</span>
          </div>
        </div>
      </template>
      <div class="flex flex-col">
        <div class="file-upload-holder flex flex-1 flex-col items-center gap-2">
          <FileUpload
            name="gpx"
            accept=".gpx"
            mode="basic"
            :customUpload="true"
            auto
            chooseLabel="Choisir un fichier GPX"
            chooseIcon="pi pi-file"
            @select="addFile"
          />
          <div v-if="gpxFile">
            <ColorTag color="neutral">
              <div class="max-w-[250px] min-w-0 truncate">
                {{ gpxFile.name }}
              </div>
              <button
                type="button"
                class="m-1 text-grey-600 hover:text-grey-900 font-bold cursor-pointer"
                @click="removeFile"
              >
                ×
              </button>
            </ColorTag>
          </div>
        </div>
        <div class="flex flex-1 flex-col">
          <Divider />

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              Nom du plan de course
            </label>
            <InputText
              v-model="raceName"
              type="text"
              placeholder="Nom"
              class="w-full"
            />
          </div>

          <div class="flex flex-1 gap-2 mt-2">
            <div class="flex-1">
              <label class="block mb-2 text-sm font-medium text-gray-700">
                Date de la course
              </label>
              <DatePicker
                v-model="raceDate"
                dateFormat="dd/mm/yyyy"
                showIcon
                placeholder="Date"
                :showTime="false"
              />
            </div>
            <div class="flex-1">
              <label class="block mb-2 text-sm font-medium text-gray-700">
                Heure de départ
              </label>
              <InputTime
                :time="startTime"
                @update="({ time }) => (startTime = time)"
              />
            </div>
          </div>

          <Divider />

          <div class="flex flex-col gap-2">
            <div class="font-semibold text-primary-700">Objectifs</div>
            <div class="flex flex-1">
              <div class="flex flex-1 text-sm font-medium text-gray-700">
                Allure moyenne
              </div>
              <div class="flex flex-1 text-sm font-medium text-gray-700">
                Temps total
              </div>
            </div>

            <div class="flex flex-1">
              <InputPaceDuration
                size="default"
                :pace="pace"
                :distance="totalDistance || 0"
                @update="(newPace) => (pace = newPace.pace)"
              ></InputPaceDuration>
            </div>

            <Divider />

            <div class="flex items-center gap-2">
              <Checkbox
                v-model="automaticSeparators"
                inputId="automatic_separators"
                name="generateGpxOptions"
                value="automatic_separators"
              />
              <label for="automatic_separators" class="text-sm">
                Détecter automatiquement les segments (montées/descentes)
              </label>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Annuler" severity="secondary" @click="close" />
          <Button
            label="Créer"
            icon="pi pi-check"
            @click="createCourse"
            :disabled="!gpxFile || !raceName"
          />
        </div>
      </template>
    </Panel>
  </div>
</template>

<script setup lang="ts">
import { ClimbDetector } from '@/lib/gpx/ClimbDetector';
import { GpxParse } from '@/lib/gpx/GpxParse';
import { useInjection } from '@/lib/useInjection';
import { roundOneNumber } from '@/lib/utils';
import type { AppStores } from '@/stores/AppLoader';
import { Separator } from '@/types/entities/Separator';
import {
  Button,
  Checkbox,
  DatePicker,
  Divider,
  FileUpload,
  FileUploadSelectEvent,
  InputText,
  Panel,
} from 'primevue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import ColorTag from '../tags/ColorTag.vue';
import InputPaceDuration from './inputs/InputPaceDuration.vue';
import InputTime from './inputs/InputTime.vue';

const collapsed = ref<boolean>(true);
const stores = useInjection<AppStores>('stores');
const router = useRouter();
const gpxFile = ref<{ content: string; name: string }>(null);
const raceName = ref<string | null>(null);
const raceDate = ref<Date | null>(null);
const startTime = ref<Date | null>(null);
const automaticSeparators = ref<boolean>(false);
const pace = ref<string>('06:30');

const removeFile = () => {
  raceName.value = null;
  gpxFile.value = null;
  raceDate.value = null;
  startTime.value = null;
  automaticSeparators.value = false;
  pace.value = '06:30';
};

const addFile = async (event: FileUploadSelectEvent) => {
  const uploadedFile = event.files[0];
  if (!uploadedFile) return;

  const content = await uploadedFile.text();
  const name = uploadedFile.name;
  gpxFile.value = { content, name };

  if (raceName.value === '' || raceName.value === null) {
    raceName.value = name;
  }
};

const totalDistance = computed(() => {
  if (!gpxFile.value) return;
  const parser = new GpxParse(gpxFile.value.content);
  return parser.totalDistance;
});

function close() {
  collapsed.value = true;
  raceName.value = null;
  gpxFile.value = null;
  raceDate.value = null;
  startTime.value = null;
  automaticSeparators.value = false;
  pace.value = '06:30';
}

async function createCourse() {
  if (!gpxFile.value || !raceName.value) return;

  const gpxParser = new GpxParse(gpxFile.value.content);

  const transitions = automaticSeparators.value
    ? new ClimbDetector(gpxFile.value.content).separators
    : [roundOneNumber(gpxParser.totalDistance)];

  const splits = [];

  transitions.forEach((distance: number, index: number) => {
    const startDistance = index === 0 ? 0 : splits[index - 1].endDistance;
    const endDistance = distance;
    const splitPace = pace.value || '06:30';
    splits.push({ startDistance, endDistance, pace: splitPace });
  });

  const separators = splits
    .map((el) => el.endDistance)
    .filter((el) => el !== gpxParser.totalDistance)
    .map((it) => new Separator({ distance: it }));

  const id = await stores.races.addRace({
    name: raceName.value,
    gpxContent: gpxFile.value.content,
    date: raceDate.value,
    startTime: startTime.value,
    splits,
    separators,
  });

  goToCourse(id);
}

function goToCourse(id: string) {
  router.push(`/races/${id}`);
}
</script>

<style lang="scss" scoped>
:deep(.p-datepicker),
:deep(.p-datepicker-input),
:deep(input) {
  width: 100% !important;
  max-width: 100% !important;
}
</style>
