<template>
  <InputMask
    v-model="currentDurationFormatted"
    mask="99h99"
    placeholder="hh:mm"
    style="max-width: 100px"
    size="small"
  />
</template>

<script setup lang="ts">
import {
  formattedDurationToMinutes,
  minutesToFormattedDuration,
} from '@/lib/time';
import { InputMask } from 'primevue';
import { ref, watch } from 'vue';

const emit = defineEmits(['update']);

const props = defineProps<{ duration: number }>();

const currentDurationMinutes = ref<number>(props.duration);
const currentDurationFormatted = ref<string>(
  minutesToFormattedDuration(currentDurationMinutes.value)
);

watch(currentDurationMinutes, () => {
  emit('update', {
    duration: currentDurationMinutes.value,
  });
});

watch(
  () => currentDurationFormatted.value,
  (newValue, oldValue) => {
    if (!newValue?.match(/^\d{1,2}h\d{2}$/) || newValue === oldValue) return;

    currentDurationMinutes.value = formattedDurationToMinutes(newValue);
  }
);
</script>

<style lang="scss" scoped></style>
