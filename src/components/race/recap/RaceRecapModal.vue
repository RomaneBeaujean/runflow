<template>
  <Dialog
    v-model:visible="showModal"
    header="Télécharger le récapitulatif"
    modal
    class="recap-modal"
  >
    <div class="flex flex-col gap-2">
      <div class="flex justify-center">
        <SelectButton
          v-model="printFileType"
          :options="options"
          optionLabel="name"
          optionValue="value"
          size="small"
        />
      </div>

      <Panel toggleable v-model:collapsed="paramsCollapsed">
        <template #header>
          <div
            class="flex flex-row flex-1 w-full h-full cursor-pointer"
            @click="paramsCollapsed = !paramsCollapsed"
          >
            <div class="flex items-center gap-2 cursor-pointer">
              <i class="pi pi-chart-bar"></i>
              <span class="font-bold">Paramètres à afficher</span>
            </div>
          </div>
        </template>
        <div class="flex flex-col">
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
          <SwitchToggle label="D+ split" v-model="params.splitElevation" />
          <SwitchToggle
            label="D- split"
            v-model="params.splitNegativeElevation"
          />
          <SwitchToggle label="Pente split" v-model="params.splitSlope" />
          <SwitchToggle label="Allure split" v-model="params.splitPace" />
          <SwitchToggle label="Durée split" v-model="params.splitDuration" />
          <SwitchToggle label="Heure" v-model="params.time" />
          <SwitchToggle
            label="Barrière horraire (heure)"
            v-model="params.timeBarrierTime"
          />
          <SwitchToggle
            label="Barrière horraire (temps écoulé)"
            v-model="params.timeBarrierDuration"
          />
        </div>
      </Panel>

      <div class="flex justify-center gap-2 mb-2">
        <Button
          label="Zoom +"
          variant="outlined"
          size="small"
          severity="secondary"
          @click="zoomIn"
        />
        <Button
          label="Zoom -"
          variant="outlined"
          size="small"
          severity="secondary"
          @click="zoomOut"
        />
        <Button
          label="Reset"
          variant="outlined"
          size="small"
          severity="secondary"
          @click="resetZoom"
        />
      </div>
      <div
        id="preview"
        class="w-full h-[50vh] border-1 border-gray-400 bg-gray-200 rounded p-5 overflow-auto"
      >
        <div v-show="!loading">
          <div ref="canvasContainer" id="canvas-container"></div>
        </div>
        <div
          v-show="loading"
          class="flex justify-center items-center w-full h-full"
        >
          <ProgressSpinner />
        </div>
      </div>

      <div style="position: fixed; top: 9999px">
        <RaceRecapTable :params="params" />
      </div>
    </div>

    <template #footer>
      <div>
        <Button
          label="Annuler"
          icon="pi pi-times"
          variant="outlined"
          size="small"
          severity="secondary"
          @click="closeModal"
        />
      </div>
      <div>
        <Button
          label="Télécharger"
          icon="pi pi-download"
          variant="outlined"
          size="small"
          @click="downloadFile"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import SwitchToggle from '@/components/SwitchToggle.vue';
import { useRaceRecap } from '@/composables/Race/useRaceRecap';
import { ExcelRaceRecapExporter } from '@/lib/ExcelRaceRecapExporter';
import Panzoom from '@panzoom/panzoom';
import download from 'downloadjs';
import * as htmlToImage from 'html-to-image';
import { Button, Dialog, Panel, ProgressSpinner, SelectButton } from 'primevue';
import { nextTick, onMounted, ref, watch } from 'vue';
import RaceRecapTable, { RecapParams } from './RaceRecapTable.vue';

const debounce = ref<ReturnType<typeof setTimeout>>(null);
const loading = ref(false);
const previewCanvas = ref<HTMLCanvasElement | null>(null);
const printFileType = ref<'excel' | 'color' | 'basic'>('color');
const paramsCollapsed = ref<boolean>(true);
const panzoomInstance = ref<any>(null);
const canvasContainer = ref<HTMLDivElement | null>(null);

const { showModal } = useRaceRecap();

const options = [
  { name: 'Excel', value: 'excel' },
  { name: 'Couleur', value: 'color' },
  { name: 'Noir/Blanc', value: 'basic' },
];

const params = ref<RecapParams>({
  cumulElevation: true,
  cumulNegativeElevation: false,
  time: true,
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

onMounted(() => {
  if (showModal.value) {
    initializePanzoom();
    generatePreviewDebounced();
  }
});
watch(
  () => showModal.value,
  () => {
    if (showModal.value) {
      initializePanzoom();
    }
  }
);

watch([() => showModal.value, params.value], () => {
  if (showModal.value) {
    generatePreviewDebounced();
  }
});

const zoomIn = () => panzoomInstance.value?.zoomIn();
const zoomOut = () => panzoomInstance.value?.zoomOut();
const resetZoom = () => panzoomInstance.value?.reset();

const initializePanzoom = async () => {
  await nextTick();
  panzoomInstance.value = Panzoom(canvasContainer.value);
};

const generatePreview = async () => {
  await nextTick();
  const node = document.getElementById('recap');
  const container = canvasContainer.value;

  if (!node || !container) return;
  container.innerHTML = '';
  try {
    const canvas = await htmlToImage.toCanvas(node);
    previewCanvas.value = canvas;
    canvas.setAttribute('id', 'preview-canvas');
    container.appendChild(canvas);
  } catch (err) {
    console.error('Erreur génération canvas:', err);
  } finally {
    loading.value = false;
  }
};

const generatePreviewDebounced = () => {
  clearTimeout(debounce.value);
  loading.value = true;
  debounce.value = setTimeout(() => {
    generatePreview();
  }, 1000);
};

const closeModal = () => {
  showModal.value = false;
  loading.value = false;
};

const downloadFile = () => {
  if (!previewCanvas.value) return;
  if (printFileType.value == 'excel') {
    const exporter = new ExcelRaceRecapExporter(params.value);
    exporter.exportExcel();
  } else {
    previewCanvas.value.toBlob((blob) => {
      if (!blob) return;
      download(blob, `recap-${printFileType.value}.png`);
    });
  }
};
</script>

<style lang="scss">
.p-dialog.recap-modal {
  width: 80vw;
  height: 80vh;
  max-width: 900px;

  .p-dialog-content {
    height: 100%;
    font-size: 14px;
  }

  .p-dialog-footer {
    padding-top: 20px;
  }
}

#preview > div {
  overflow: unset !important;
}

#canvas-container {
  width: auto !important;
  height: auto !important;
}

#canvas-container canvas {
  max-height: 100%;
  width: auto;
  display: block;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .p-dialog {
    width: calc(100vw - 32px) !important; /* 8px de chaque côté */
    height: calc(100vh - 32px) !important;
  }
}
</style>
