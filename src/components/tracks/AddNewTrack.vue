<template>
  <div class="swm-margin-100">
    <Button label="Importer un GPX" @click="addNewTrack = true" />

    <Dialog
      v-model:visible="addNewTrack"
      modal
      header="Ajouter un fichier GPX"
      class="min-w-[400px]"
    >
      <div class="modal-content flex flex-col gap-4">
        <!-- Nom du fichier -->
        <div class="input-name-holder">
          <InputText
            type="text"
            v-model="trackName"
            placeholder="Nom du fichier GPX"
            class="w-full"
          />
        </div>

        <!-- Upload GPX -->
        <div class="file-upload-holder flex items-center gap-2">
          <FileUpload
            name="gpx"
            accept=".gpx"
            mode="basic"
            :customUpload="true"
            auto
            chooseLabel="Choisir un fichier GPX"
            @select="addFile"
          />

          <!-- Tag du nom de fichier -->
          <div
            v-if="file"
            class="flex justify-center items-center max-w-[150px] truncate"
          >
            <Tag
              severity="info"
              :value="file.name"
              class="truncate text-center w-full"
            />
          </div>
        </div>

        <!-- Boutons -->
        <div class="import-button-holder flex justify-end mt-4 gap-2">
          <Button label="Annuler" @click="closeModal" severity="secondary" />
          <Button label="Importer" @click="handleUpload" :disabled="!file" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useInjection } from '@/lib/useInjection';
import type { AppStores } from '@/stores/AppLoader';
import { Button, Dialog, FileUpload, InputText, Tag } from 'primevue';
import { ref } from 'vue';

const stores = useInjection<AppStores>('stores');

const addNewTrack = ref(false);
const file = ref<any>(null);
const trackName = ref<string>('');

const addFile = async (event) => {
  const uploaded = event.files[0];
  if (!uploaded) return;

  const text = await uploaded.text();
  const name = uploaded.name;
  file.value = { text, name };

  if (trackName.value === '') {
    trackName.value = name;
  }
};

const handleUpload = async () => {
  if (!file.value) return;
  const name = trackName.value || file.value.name;
  const content = file.value.text;

  await stores.tracks.addTrack({ name, content });
  closeModal();
};

const closeModal = () => {
  trackName.value = '';
  addNewTrack.value = false;
  file.value = null;
};
</script>

<style scoped lang="scss"></style>
