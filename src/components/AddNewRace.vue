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
      class="min-w-[400px]"
    >
      <div class="flex flex-col gap-4">
        <!-- Sélection de la trace GPX -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Choisissez la trace GPX
          </label>
          <Dropdown
            v-model="selectedTrackId"
            :options="trackOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Sélectionnez une trace"
            class="w-full"
            showClear
          />
        </div>

        <!-- Nom du plan -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Nom du plan de course
          </label>
          <InputText
            v-model="newCourseName"
            type="text"
            placeholder="Nom du plan de course"
            class="w-full"
          />
        </div>

        <!-- Boutons -->
        <div class="flex justify-end gap-2 pt-4">
          <Button label="Annuler" severity="secondary" @click="closeModal" />
          <Button
            label="Créer"
            icon="pi pi-check"
            @click="createCourse"
            :disabled="!selectedTrackId || !newCourseName"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useInjection } from '@/lib/useInjection';
import type { AppStores } from '@/stores/AppLoader';
import { Button, Dialog, Dropdown, InputText } from 'primevue';
import { computed, ref } from 'vue';

const stores = useInjection<AppStores>('stores');

const selectedTrackId = ref<string | null>(null);
const newCourseName = ref<string | null>(null);
const modalOpened = ref<boolean>(false);

const trackOptions = computed(() =>
  stores.tracks.tracks.map((t) => ({
    label: t.name,
    value: t.id,
  }))
);

function openModal() {
  modalOpened.value = true;
}

function closeModal() {
  modalOpened.value = false;
  newCourseName.value = null;
  selectedTrackId.value = null;
}

async function createCourse() {
  if (!selectedTrackId.value || !newCourseName.value) return;

  await stores.races.addRace({
    name: newCourseName.value,
    trackId: selectedTrackId.value,
  });

  closeModal();
}
</script>

<style scoped lang="scss"></style>
