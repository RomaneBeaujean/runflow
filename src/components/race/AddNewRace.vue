<template>
  <div class="m-4">
    <Button
      label="Ajouter un nouveau plan de course"
      icon="pi pi-plus"
      @click="openModal"
    />

    <Dialog
      v-model:visible="modalOpened"
      modal
      header="Créer un nouveau plan de course"
      :style="{ width: '50vw' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div class="flex flex-col items-center mb-4">
        <div class="file-upload-holder flex flex-1 items-center flex-col gap-2">
          <FileUpload
            name="gpx"
            accept=".gpx"
            mode="basic"
            :customUpload="true"
            auto
            chooseLabel="Choisir un fichier GPX"
            @select="addFile"
          />
          <div v-if="gpxFile">
            <Tag severity="secondary">
              {{ gpxFile.name }}
              <button
                type="button"
                class="m-1 text-grey-600 hover:text-grey-900 font-bold cursor-pointer"
                @click="gpxFile = null"
              >
                ×
              </button>
            </Tag>
          </div>
        </div>
      </div>

      <Panel
        header="Options de course"
        v-if="totalDistance"
        class="flex flex-1"
      >
        <div class="mb-2">
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Nom du plan de course
          </label>
          <InputText
            v-model="raceName"
            type="text"
            placeholder="Nom du plan de course"
            class="w-full"
          />
        </div>

        <div class="flex flex-1 gap-2 mb-2">
          <div class="flex-1">
            <label class="block mb-2 text-sm font-medium text-gray-700">
              Date de la course
            </label>
            <DatePicker
              v-model="raceDate"
              dateFormat="dd/mm/yyyy"
              showIcon
              placeholder="Choisir une date"
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

        <div class="flex flex-col gap-2 mb-2">
          <div class="flex flex-1">
            <div class="flex flex-1 text-sm font-medium text-gray-700">
              Allure souhaité
            </div>
            <div class="flex flex-1 text-sm font-medium text-gray-700">
              Temps souhaité
            </div>
          </div>

          <div class="flex flex-1">
            <InputPaceDuration
              size="default"
              :pace="pace"
              :distance="totalDistance"
              @update="(newPace) => (pace = newPace.pace)"
            ></InputPaceDuration>
          </div>

          <div class="flex items-center gap-2 mt-4">
            <Checkbox
              v-model="automaticSeparators"
              inputId="automatic_separators"
              name="generateGpxOptions"
              value="automatic_separators"
            />
            <label for="automatic_separators">
              Générer automatiquement les splits
            </label>
          </div>
        </div>
      </Panel>

      <div class="flex justify-end gap-2 pt-4">
        <Button label="Annuler" severity="secondary" @click="closeModal" />
        <Button
          label="Créer"
          icon="pi pi-check"
          @click="createCourse"
          :disabled="!gpxFile || !raceName"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import InputTime from '@/components/race/inputs/InputTime.vue';
import { useGpxParser } from '@/composables/useGpxParser';
import { useInjection } from '@/lib/useInjection';
import type { AppStores } from '@/stores/AppLoader';
import { Separator } from '@/types/entities/Separator';
import {
  Button,
  Checkbox,
  DatePicker,
  Dialog,
  FileUpload,
  FileUploadSelectEvent,
  InputText,
  Panel,
  Tag,
} from 'primevue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import InputPaceDuration from './inputs/InputPaceDuration.vue';

const stores = useInjection<AppStores>('stores');
const router = useRouter();
const gpxFile = ref<{ content: string; name: string }>(null);
const raceName = ref<string | null>(null);
const modalOpened = ref<boolean>(false);
const raceDate = ref<Date | null>(null);
const startTime = ref<Date | null>(null);
const automaticSeparators = ref<boolean>(false);
const pace = ref<string>('06:30');

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
  const parser = useGpxParser(gpxFile.value.content);
  return parser.gpxtotalDistance;
});

function openModal() {
  modalOpened.value = true;
}

function closeModal() {
  modalOpened.value = false;
  raceName.value = null;
  gpxFile.value = null;
}

async function createCourse() {
  if (!gpxFile.value || !raceName.value) return;

  const gpxParser = useGpxParser(gpxFile.value.content);
  const splits = automaticSeparators.value ? gpxParser.generateSplits() : [];

  const separators = splits
    .map((el) => el.endDistance)
    .filter((el) => el !== gpxParser.gpxtotalDistance)
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
:deep(input),
:deep(.p-datepicker) {
  width: 100%;
  max-width: 100% !important;
}
</style>
