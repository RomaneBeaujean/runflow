<template>
  <div
    v-if="position"
    :style="{
      position: 'absolute',
      left: position.left,
      top: position.top,
      transform: 'translate(-50%, -50%)',
    }"
  >
    <div class="mt-12 bg-white rounded-md">
      <Button
        icon="pi pi-trash"
        label="Supprimer"
        class="w-full"
        size="small"
        severity="danger"
        text
        @click="props.delete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Position } from '@/types/Position';
import { Button } from 'primevue';
import { onMounted, ref } from 'vue';

const props = defineProps<{
  position: Position | null;
  delete: () => void;
}>();

const target = ref<HTMLElement | null>(null);
onMounted(() => {
  if (!target.value) return;
});
</script>

<style scoped></style>
