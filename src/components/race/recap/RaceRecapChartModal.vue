<template>
  <Dialog v-model:visible="showChartModal" modal class="recap-chart-modal">
    <template #header>
      <span class="font-bold">Télécharger le profil de la course</span>
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
              label="Heure"
              v-model="params.time"
            />
            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="Temps écoulé"
              v-model="params.totalDuration"
            />
          </div>

          <Divider layout="vertical" />

          <div class="flex-1">
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
            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="Dénivelé split"
              v-model="params.splitElevation"
            />
            <SwitchToggle
              :display="isMobile ? 'col' : 'row'"
              label="Pente split"
              v-model="params.splitSlope"
            />
          </div>
        </div>
      </Panel>

      <div
        id="preview"
        class="w-full h-[500px] p-3 border-1 border-gray-400 bg-gray-200 rounded overflow-auto"
      >
        <div style="pointer-events: none">
          <RaceRecapChart :params="params" />
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
        <Button
          size="small"
          icon="pi pi-download"
          variant="outlined"
          label="Télécharger"
          @click="downloadFile"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import RaceRecapChart, {
  RecapChartParams,
} from '@/components/race/recap/RaceRecapChart.vue';
import SwitchToggle from '@/components/SwitchToggle.vue';
import { useRace } from '@/composables/useRace';
import { useRaceRecap } from '@/composables/useRaceRecap';
import { useViewport } from '@/composables/useViewport';
import download from 'downloadjs';
import html2canvas from 'html2canvas';
import { Button, Dialog, Divider, Panel } from 'primevue';
import { ref } from 'vue';

const { race } = useRace();
const { showChartModal } = useRaceRecap();
const { isMobile } = useViewport();
const paramsCollapsed = ref<boolean>(true);

const params = ref<RecapChartParams>({
  time: true,
  totalDuration: true,
  splitPace: true,
  splitDuration: true,
  splitElevation: true,
  splitSlope: true,
});

const closeModal = () => {
  showChartModal.value = false;
};

const downloadFile = async () => {
  const node = document.getElementById('chartRecap');
  const canvas = await html2canvas(node, {
    backgroundColor: 'white',
  });
  const dataUrl = canvas.toDataURL('image/png');
  download(dataUrl, `Profil - ${race.value.name}`);
};
</script>

<style lang="scss">
.p-dialog.recap-chart-modal {
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
