<template>
  <div
    v-if="position"
    :style="{ position: 'absolute', left: position.left, top: position.top }"
    :key="position.left"
  >
    <div style="transform: translate(-50%, -50%)">
      <i class="pi pi-map-marker text-primary text-lg"></i>
      <div ref="anchor" style="transform: translate(-14px)"></div>
    </div>

    <!-- Popover -->
    <Popover
      ref="popoverRef"
      class="bg-white border border-gray-200 shadow-lg rounded-lg p-1 min-w-[200px]"
      :dismissable="false"
    >
      <div class="flex flex-col gap-1">
        <Button
          label="Ajouter un séparateur"
          icon="pi pi-plus"
          size="small"
          class="p-button-text w-full justify-start hover:bg-gray-100"
          @click="() => handleClick(false)"
        />
        <Button
          label="Ajouter un ravitaillement"
          icon="pi pi-plus"
          size="small"
          class="p-button-text w-full justify-start hover:bg-gray-100"
          @click="() => handleClick(true)"
        />
        <Button
          label="Fermer"
          size="small"
          class="p-button-text p-button-secondary w-full justify-start hover:bg-gray-200"
          @click="onClosePopover"
        />
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { Position } from '@/types/Position';
import Button from 'primevue/button';
import Popover from 'primevue/popover';
import { nextTick, ref, watch } from 'vue';

const props = defineProps<{
  position: Position | null;
  addSeparator: (refuel: boolean) => void;
  closeTooltip: () => void;
}>();

const popoverRef = ref<InstanceType<typeof Popover> | null>(null);
const anchor = ref<HTMLElement | null>(null);

// Ouvrir la popover dès que position est définie
const openPopover = () => {
  if (popoverRef.value && anchor.value) {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    Object.defineProperty(event, 'currentTarget', { value: anchor.value });
    popoverRef.value.show(event);
  }
};

watch(
  () => props.position,
  async (pos) => {
    if (pos) {
      await nextTick();
      openPopover();
    }
  },
  { immediate: true }
);

const handleClick = (refuel: boolean) => {
  props.addSeparator(refuel);
  popoverRef.value?.hide();
};

const onClosePopover = () => {
  props.closeTooltip();
  popoverRef.value?.hide();
};
</script>
