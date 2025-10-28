<template>
  <Dialog
    v-model:visible="showModal"
    header="Télécharger le récapitulatif"
    modal
    :style="{ width: '80%', height: '80%' }"
  >
    <div class="flex flex-col gap-2">
      <Fieldset legend="Paramètres à afficher">
        <div class="flex">
          <div class="flex-1">
            <SwitchToggle label="Ravitaillement" v-model="params.refuel" />
            <SwitchToggle
              label="Temps d'arrêt (ravito)"
              v-model="params.stopRefuelDuration"
            />
            <SwitchToggle label="D+ total" v-model="params.cumulElevation" />
            <SwitchToggle
              label="D- total"
              v-model="params.cumulNegativeElevation"
            />
          </div>
          <Divider layout="vertical" />

          <div class="flex-1">
            <SwitchToggle label="D+ split" v-model="params.splitElevation" />
            <SwitchToggle
              label="D- split"
              v-model="params.splitNegativeElevation"
            />
            <SwitchToggle label="Pente split" v-model="params.splitSlope" />
            <SwitchToggle label="Allure split" v-model="params.splitPace" />
            <SwitchToggle label="Durée split" v-model="params.splitDuration" />
          </div>

          <Divider layout="vertical" />

          <div class="flex-1">
            <SwitchToggle label="Heure" v-model="params.time" />
            <SwitchToggle label="Temps écoulé" v-model="params.totalDuration" />
            <SwitchToggle
              label="Barrière horraire (heure)"
              v-model="params.timeBarrierTime"
            />
            <SwitchToggle
              label="Barrière horraire (temps écoulé)"
              v-model="params.timeBarrierDuration"
            />
          </div>
        </div>
      </Fieldset>

      <Fieldset legend="Prévisualisation">
        <div class="max-w-[100%] overflow-auto bg-gray-200 p-5 rounded">
          <RaceRecapTable :params="params" />
        </div>
      </Fieldset>
    </div>

    <template #footer>
      <div class="mt-5 flex gap-2">
        <Button label="Annuler" text severity="secondary" @click="closeModal" />
        <Button
          label="Télécharger (Excel)"
          icon="pi file-excel"
          variant="outlined"
          severity="secondary"
          @click="downloadExcel"
        />
        <Button
          label="Télécharger"
          icon="pi pi-download"
          variant="outlined"
          @click="downloadRecap"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import SwitchToggle from '@/components/SwitchToggle.vue';
import { useRaceRecap } from '@/composables/Race/useRaceRecap';
import { ExcelRaceRecapExporter } from '@/lib/ExcelRaceRecapExporter';
import download from 'downloadjs';
import * as htmlToImage from 'html-to-image';
import { Button, Dialog, Divider, Fieldset } from 'primevue';
import { ref } from 'vue';
import RaceRecapTable, { RecapParams } from './RaceRecapTable.vue';

const { showModal } = useRaceRecap();

const params = ref<RecapParams>({
  cumulElevation: true,
  cumulNegativeElevation: false,
  time: true,
  totalDuration: true,
  timeBarrierTime: true,
  timeBarrierDuration: false,
  splitElevation: true,
  splitNegativeElevation: true,
  splitSlope: true,
  splitPace: true,
  splitDuration: true,
  refuel: true,
  stopRefuelDuration: true,
});

const closeModal = () => {
  showModal.value = false;
};

const downloadRecap = () => {
  htmlToImage
    .toPng(document.getElementById('recap'))
    .then((dataUrl) => download(dataUrl, 'recap.png'));
};

const downloadExcel = () => {
  const exporter = new ExcelRaceRecapExporter(params.value);
  exporter.exportExcel();
};
</script>

<style scoped></style>
