<template>
  <Dialog v-model:visible="showTableModal" modal class="recap-modal">
    <template #header>
      <span class="font-bold">Télécharger le tableau récapitulatif</span>
    </template>
    <div class="flex flex-col gap-2">
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
        <div class="flex">
          <div class="flex-1">
            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="Ravitaillement"
              v-model="params.refuel"
            />

            <Divider />

            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="D+ total"
              v-model="params.cumulElevation"
            />
            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="D- total"
              v-model="params.cumulNegativeElevation"
            />
          </div>
          <Divider layout="vertical" />
          <div class="flex-1">
            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="D+ split"
              v-model="params.splitElevation"
            />
            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="D- split"
              v-model="params.splitNegativeElevation"
            />
            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="Pente split"
              v-model="params.splitSlope"
            />
            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="Allure split"
              v-model="params.splitPace"
            />
            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="Durée split"
              v-model="params.splitDuration"
            />
          </div>
          <Divider layout="vertical" />
          <div class="flex-1">
            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="Heure"
              v-model="params.time"
            />
            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="Temps d'arrêt (ravitaillement)"
              v-model="params.stopRefuelDuration"
            />

            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="Barrière horraire (heure)"
              v-model="params.timeBarrierTime"
            />
            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="Barrière horraire (temps écoulé)"
              v-model="params.timeBarrierDuration"
            />
          </div>
        </div>
      </Panel>

      <div
        id="preview"
        class="w-full h-[500px] p-3 border-1 border-gray-400 bg-gray-200 rounded overflow-auto"
      >
        <div
          v-show="!loading"
          ref="canvasContainer"
          id="canvas-container"
        ></div>
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
        <SplitButton
          size="small"
          icon="pi pi-download"
          variant="outlined"
          :label="splitButtonLabel"
          :model="items"
          @click="downloadFile"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import SwitchToggle from '@/components/SwitchToggle.vue';
import { useRace } from '@/composables/Race/useRace';
import { useRaceRecap } from '@/composables/Race/useRaceRecap';
import { useViewport } from '@/composables/useViewport';
import { ExcelRaceRecapExporter } from '@/lib/ExcelRaceRecapExporter';
import download from 'downloadjs';
import * as htmlToImage from 'html-to-image';
import {
  Button,
  Dialog,
  Divider,
  Panel,
  ProgressSpinner,
  SplitButton,
} from 'primevue';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import RaceRecapTable, { RecapParams } from './RaceRecapTable.vue';

const debounce = ref<ReturnType<typeof setTimeout>>(null);
const loading = ref(false);
const previewCanvas = ref<HTMLCanvasElement | null>(null);
const printFileType = ref<'excel' | 'image'>('image');
const paramsCollapsed = ref<boolean>(true);
const canvasContainer = ref<HTMLDivElement | null>(null);

const { isMobile } = useViewport();
const { race } = useRace();
const { showTableModal } = useRaceRecap();
const splitButtonLabel = computed(() => {
  if (printFileType.value === 'image') return 'Télécharger (.png)';
  if (printFileType.value === 'excel') return 'Télécharger (.xlsx)';
});
const items = [
  {
    label: 'Excel (.xlsx)',
    command: () => {
      printFileType.value = 'excel';
    },
  },
  {
    label: 'Image (.png)',
    command: () => {
      printFileType.value = 'image';
    },
  },
];

const params = ref<RecapParams>({
  cumulElevation: false,
  cumulNegativeElevation: false,
  time: true,
  timeBarrierTime: true,
  timeBarrierDuration: false,
  splitElevation: true,
  splitNegativeElevation: false,
  splitSlope: true,
  splitPace: true,
  splitDuration: true,
  refuel: true,
  stopRefuelDuration: false,
});

onMounted(() => {
  if (showTableModal.value) {
    generatePreview();
  }
});

watch(
  () => printFileType.value,
  () => {
    if (showTableModal.value) {
      generatePreviewDebounced();
    }
  }
);

watch(
  () => showTableModal.value,
  () => {
    if (showTableModal.value) {
      generatePreview();
    }
  }
);

watch(params.value, () => {
  if (showTableModal.value) {
    generatePreviewDebounced();
  }
});

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
  showTableModal.value = false;
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
      download(blob, `recap-${race.value.name}.png`);
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

#preview #canvas-container {
  height: 100%;
}

#preview #canvas-container canvas {
  max-height: 100%;
  max-width: 1000px;
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
