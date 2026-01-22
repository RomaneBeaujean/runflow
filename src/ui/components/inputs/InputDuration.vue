<template>
  <InputMask v-model="currentDurationFormatted" mask="99h99" placeholder="hh:mm" style="max-width: 100px"
    size="small" />
</template>

<script setup lang="ts">
import {
  formattedDurationToMinutes,
  minutesToFormattedDuration,
} from '@/domain/helpers/Time.helper';
import { InputMask } from 'primevue';
import { ref, watch } from 'vue';

const emit = defineEmits(['update:duration']);

const props = defineProps<{ duration: number | null }>();

const currentDurationMinutes = ref<number>(props.duration ?? null);
const currentDurationFormatted = ref<string>(
  props.duration ? minutesToFormattedDuration(currentDurationMinutes.value) : null
);

watch(currentDurationMinutes, () => {
  emit('update:duration', currentDurationMinutes.value);
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
