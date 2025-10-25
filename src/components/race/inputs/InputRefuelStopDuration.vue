<template>
  <InputNumber
    v-model="currentDurationMinutes"
    :step="1"
    :min="0"
    placeholder="min"
    class="w-auto"
    style="width: 70px"
    size="small"
    showButtons
  />
</template>

<script setup lang="ts">
import { InputNumber } from 'primevue';
import { ref, watch } from 'vue';

const emit = defineEmits(['update']);

const props = defineProps<{ duration: number }>();

const currentDurationMinutes = ref<number>(props.duration);

watch(currentDurationMinutes, () => {
  emit('update', {
    duration: currentDurationMinutes.value,
  });
});
</script>

<style lang="scss" scoped></style>
