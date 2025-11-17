<template>
  <Button
    icon="pi pi-cog"
    text
    severity="secondary"
    size="small"
    @click="opened = true"
  ></Button>
  <Drawer v-model:visible="opened" header="Paramètres" position="right">
    <div class="flex flex-col flex-1 p-5 gap-2">
      <SwitchToggle
        v-model:model-value="stickyChart"
        label="Ancrer le graphique en haut de la page"
      />

      <SwitchToggle
        v-model:model-value="showSlopeAreaColor"
        label="Colorer la courbe en fonction du % de pente"
      />

      <Divider />

      <div class="font-xs font-semibold">Séparateurs</div>

      <SwitchToggle
        v-model:model-value="showSeparatorDuration"
        label="Afficher le temps écoulé"
      />

      <Divider />

      <div class="font-xs font-semibold">Point survolé</div>

      <SwitchToggle
        v-model:model-value="showPointSlope"
        label="Afficher le % de pente"
      />

      <SwitchToggle
        v-model:model-value="showPointPace"
        label="Afficher l'allure"
      />

      <SwitchToggle
        v-model:model-value="showPointDuration"
        label="Afficher le temps écoulé"
      />

      <SwitchToggle
        v-model:model-value="showPointTime"
        label="Afficher l'heure"
      />
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { useRaceChartParams } from '@/composables/useRaceChartParams';
import { Button, Divider, Drawer } from 'primevue';
import { ref } from 'vue';
import SwitchToggle from '../SwitchToggle.vue';

const opened = ref(false);
const {
  stickyChart,
  showSlopeAreaColor,
  showSeparatorDuration,
  showPointTime,
  showPointSlope,
  showPointPace,
  showPointDuration,
} = useRaceChartParams();
</script>

<style scoped lang="scss"></style>
