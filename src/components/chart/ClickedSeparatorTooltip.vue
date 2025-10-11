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
    <div class="separator-tooltip-target">
      <swm-tooltip size="large" variant="manual" opened>
        <div slot="content">
          <swm-action @swmactionclick="props.delete">
            <swm-icon name="trash"></swm-icon>
          </swm-action>
        </div>
      </swm-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Position } from '@/domain/entities/Position';

const props = defineProps<{
  position: Position | null;
  delete: () => void;
}>();
</script>

<style scoped>
.separator-tooltip-target {
  width: 15px;
  height: 15px;
  background-color: transparent;
}
</style>
