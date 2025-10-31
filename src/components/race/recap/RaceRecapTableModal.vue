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
        class="w-full max-h-[500px] p-3 border-1 border-gray-400 bg-gray-200 rounded overflow-auto"
      >
        <div style="pointer-events: none">
          <RaceRecapTable :params="params" />
        </div>
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
import RaceRecapTable, {
  RecapParams,
} from '@/components/race/recap/RaceRecapTable.vue';
import SwitchToggle from '@/components/SwitchToggle.vue';
import { useRace } from '@/composables/Race/useRace';
import { useRaceRecap } from '@/composables/Race/useRaceRecap';
import { useViewport } from '@/composables/useViewport';
import { ExcelRaceRecapExporter } from '@/lib/ExcelRaceRecapExporter';
import download from 'downloadjs';
import html2canvas from 'html2canvas';
import { Button, Dialog, Divider, Panel, SplitButton } from 'primevue';
import { computed, ref } from 'vue';

const previewCanvas = ref<HTMLCanvasElement | null>(null);
const printFileType = ref<'excel' | 'image'>('image');
const paramsCollapsed = ref<boolean>(true);

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

const closeModal = () => {
  showTableModal.value = false;
};

const downloadFile = async () => {
  if (printFileType.value == 'excel') {
    const exporter = new ExcelRaceRecapExporter(params.value);
    exporter.exportExcel();
  } else {
    const node = document.getElementById('tableRecap');
    const canvas = await html2canvas(node, {
      backgroundColor: 'white',
    });
    const dataUrl = canvas.toDataURL('image/png');
    download(dataUrl, `Profil - ${race.value.name}`);
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

@media (max-width: 768px) {
  .p-dialog {
    width: calc(100vw - 32px) !important; /* 8px de chaque côté */
    height: calc(100vh - 32px) !important;
  }
}
</style>
