<template>
  <InputNumber
    :modelValue="distance"
    @input="emitUpdate"
    mode="decimal"
    placeholder="0"
    showButtons
    :min="0"
    :max="totalDistance - 0.1"
    :step="0.1"
    style="width: 80px"
    size="small"
  />
</template>
<script lang="ts" setup>
import { useRace } from '@/composables/useRace';
import { InputNumber, InputNumberInputEvent } from 'primevue';
import { ref } from 'vue';

const emit = defineEmits(['update']);

const props = defineProps<{ distance: number | null }>();
const { totalDistance } = useRace();

const distance = ref<number>(props.distance);

const emitUpdate = (e: InputNumberInputEvent) => {
  const value = e.value;
  emit('update', value);
};
</script>

<style lang="scss" scoped></style>
