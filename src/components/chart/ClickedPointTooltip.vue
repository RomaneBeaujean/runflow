<template>
  <div
    v-if="position"
    :style="{
      position: 'absolute',
      left: position.left,
      top: position.top,
    }"
    :key="position.left"
  >
    <swm-icon
      name="location-crosshairs"
      size="xsmall"
      class="swm-text-primary-700"
    >
      <swm-tooltip size="large" variant="manual" opened>
        <div slot="content">
          <swm-button
            type="text"
            size="small"
            fullwidth
            @click="onAddSeparator"
          >
            <button type="button">
              <swm-icon slot="left" name="plus"></swm-icon>
              <span slot="label">Ajouter un séparateur</span>
            </button>
          </swm-button>
          <swm-button
            type="text"
            variant="secondary"
            fullwidth
            size="small"
            class="swm-margin-top-50"
            @click="onClose"
          >
            <button type="button">
              <span slot="label">Fermer</span>
            </button>
          </swm-button>
        </div>
      </swm-tooltip>
    </swm-icon>
  </div>
</template>

<script setup lang="ts">
import { Position } from '@/domain/entities/Position';

const props = defineProps<{
  position: Position | null;
  addSeparator: () => void;
  closeTooltip: () => void;
}>();

const onAddSeparator = () => {
  props.addSeparator();
};

const onClose = () => {
  props.closeTooltip();
};
</script>

<style scoped></style>
