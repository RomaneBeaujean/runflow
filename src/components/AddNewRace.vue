<template>
  <div class="m-4">
    <!-- Bouton principal -->
    <Button
      label="Ajouter un nouveau plan de course"
      icon="pi pi-plus"
      @click="openModal"
    />

    <!-- Modale -->
    <Dialog
      v-model:visible="modalOpened"
      modal
      header="Créer un nouveau plan de course"
      :style="{ width: '50vw' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div class="flex flex-col gap-4">
        <!-- Sélection de la trace GPX -->
        <div class="file-upload-holder flex flex-col gap-2">
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

        <!-- Nom du plan -->
        <div>
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

        <!-- Date de la course (optionnelle) -->
        <div class="flex gap-2">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              Date de la course
            </label>
            <DatePicker
              v-model="raceDate"
              locale="fr"
              dateFormat="dd-mm-yy"
              showIcon
              placeholder="Choisir une date"
              :showTime="false"
            />
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              Heure de départ
            </label>
            <InputTime
              :time="startTime"
              @update="({ time }) => (startTime = time)"
            />
          </div>
        </div>

        <!-- Boutons -->
        <div class="flex justify-end gap-2 pt-4">
          <Button label="Annuler" severity="secondary" @click="closeModal" />
          <Button
            label="Créer"
            icon="pi pi-check"
            @click="createCourse"
            :disabled="!gpxFile || !raceName"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useInjection } from '@/lib/useInjection';
import type { AppStores } from '@/stores/AppLoader';
import { Race } from '@/types/entities/Race';
import {
  Button,
  DatePicker,
  Dialog,
  FileUpload,
  FileUploadSelectEvent,
  InputText,
  Tag,
} from 'primevue';
import { ref } from 'vue';
import InputTime from './InputTime.vue';

const stores = useInjection<AppStores>('stores');

const gpxFile = ref<{ content: string; name: string }>(null);
const raceName = ref<string | null>(null);
const modalOpened = ref<boolean>(false);
const raceDate = ref<Date | null>(null);
const startTime = ref<Date | null>(null);

const addFile = async (event: FileUploadSelectEvent) => {
  const uploaded = event.files[0];
  if (!uploaded) return;

  const content = await uploaded.text();
  const name = uploaded.name;
  gpxFile.value = { content, name };

  if (raceName.value === '' || raceName.value === null) {
    raceName.value = name;
  }
};

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

  const race: Partial<Race> = {
    name: raceName.value,
    gpxContent: gpxFile.value.content,
    date: raceDate.value,
    startTime: startTime.value,
  };

  await stores.races.addRace({
    name: raceName.value,
    gpxContent: gpxFile.value.content,
    date: raceDate.value,
    startTime: startTime.value,
  });

  closeModal();
}
</script>

<style scoped lang="scss"></style>
