<template>
  <InputMask
    v-model="currentTimeFormatted"
    mask="99:99"
    placeholder="hh:mm"
    style="max-width: 100px"
    size="small"
  />
</template>

<script setup lang="ts">
import { InputMask } from 'primevue';
import { ref, watch } from 'vue';

const emit = defineEmits(['update']);
const props = defineProps<{
  time: Date | null;
  reference?: Date; // date de référence pour transformer hh:mm en Date
}>();

// Formatte initial
const currentTimeFormatted = ref<string>(
  props.time
    ? props.time.getHours().toString().padStart(2, '0') +
        ':' +
        props.time.getMinutes().toString().padStart(2, '0')
    : ''
);

watch(currentTimeFormatted, (newValue) => {
  if (!newValue.match(/^\d{1,2}:\d{2}$/)) return;

  const [hh, mm] = newValue.split(':').map(Number);
  const base = props.reference || new Date();
  const updatedDate = new Date(base);
  updatedDate.setHours(hh, mm, 0, 0);

  emit('update', { time: updatedDate });
});
</script>

<style scoped lang="scss">
:deep(input) {
  max-width: 100%;
}
</style>
