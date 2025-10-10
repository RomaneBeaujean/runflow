<template>
  <div class="tracks">
    <h2>Parcours GPX</h2>

    <Button label="Importer un GPX" @click="addNewTrack = true" />

    <DataTable :value="gpxFiles" stripedRows>
      <Column field="name" header="Nom" />
      <Column field="createdAt" header="Importé le" />
    </DataTable>

    <Dialog
      v-model:visible="addNewTrack"
      modal
      header="Ajouter un fichier GPX"
      :style="{ width: '25rem' }"
    >
      <InputText
        type="text"
        v-model="trackName"
        placeholder="Nom du fichier GPX"
      />

      <FileUpload
        name="gpx"
        accept=".gpx"
        mode="basic"
        :customUpload="true"
        auto
        :chooseLabel="'Choisir un fichier GPX'"
        @select="handleUpload"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { useGpxStore } from '@/stores/gpxStore';
import {
  Button,
  Column,
  DataTable,
  Dialog,
  FileUpload,
  InputText,
} from 'primevue';
import { ref } from 'vue';

const { gpxFiles, addGpxFile } = useGpxStore();

const addNewTrack = ref(false);
const trackName = ref('');

function onImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.gpx';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    addGpxFile(file.name, text);
  };

  input.click();
}

const handleUpload = async (event) => {
  const file = event.files[0];
  if (!file) return;

  const text = await file.text();
  const name = trackName.value.trim() || file.name;

  addGpxFile(name, text);

  // Reset
  trackName.value = '';
  addNewTrack.value = false;
};
</script>

<style lang="scss">
.tracks {
  flex: 1 1 auto;
  position: relative;
}
</style>
