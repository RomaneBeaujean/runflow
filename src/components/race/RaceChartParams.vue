<template>
  <Button
    v-if="!isMobile"
    icon="pi pi-cog"
    outlined
    severity="secondary"
    label="Paramètres d'affichage"
    size="small"
    @click="opened = true"
  ></Button>
  <Button
    v-else
    icon="pi pi-cog"
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

      <div class="font-xs font-semibold">Allure</div>

      <SwitchToggle
        v-model:model-value="showPaceLine"
        label="Afficher la courbe d'allure"
      />

      <Divider />

      <div class="font-xs font-semibold">Séparateurs</div>

      <SwitchToggle
        v-model:model-value="showSeparator"
        label="Afficher les séparateurs"
      />
      <SwitchToggle
        v-model:model-value="showSeparatorDistance"
        label="Afficher la distance"
      />

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
import { useViewport } from '@/composables/useViewport';
import { Button, Divider, Drawer } from 'primevue';
import { ref } from 'vue';
import SwitchToggle from '../SwitchToggle.vue';
const { isMobile } = useViewport();
const opened = ref(false);
const {
  stickyChart,
  showSlopeAreaColor,
  showSeparatorDuration,
  showPointTime,
  showPointSlope,
  showSeparator,
  showSeparatorDistance,
  showPointPace,
  showPointDuration,
  showPaceLine,
} = useRaceChartParams();
</script>

<style scoped lang="scss"></style>
