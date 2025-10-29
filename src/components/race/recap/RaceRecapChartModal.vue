<template>
  <Dialog v-model:visible="showChartModal" modal class="recap-chart-modal">
    <template #header>
      <span class="font-bold">Télécharger le profil de la course</span>
    </template>
    <div class="flex flex-col gap-2"></div>

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
import { useRace } from '@/composables/Race/useRace';
import { useRaceRecap } from '@/composables/Race/useRaceRecap';
import download from 'downloadjs';
import { Button, Dialog } from 'primevue';
import { ref } from 'vue';

const previewCanvas = ref<HTMLCanvasElement | null>(null);
const loading = ref(false);
const { race } = useRace();
const { showChartModal } = useRaceRecap();

const closeModal = () => {
  showChartModal.value = false;
  loading.value = false;
};

const downloadFile = () => {
  if (!previewCanvas.value) return;

  previewCanvas.value.toBlob((blob) => {
    if (!blob) return;
    download(blob, `recap-chart-${race.value.name}.png`);
  });
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

#preview #canvas-container {
  height: 100%;
}

#preview #canvas-container canvas {
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
