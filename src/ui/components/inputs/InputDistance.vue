<template>
  <InputNumber :modelValue="distance" @input="emitUpdate" mode="decimal" placeholder="0" showButtons :min="0"
    :max="totalDistance - 0.1" :step="0.1" :style="inputStyle" size="small" />
</template>
<script lang="ts" setup>
import { useRace } from '@/ui/composables/useRace';
import { InputNumber, InputNumberInputEvent } from 'primevue';
import { computed, ref } from 'vue';

const emit = defineEmits(['update']);

const props = defineProps<{ distance: number | null, fluid?: boolean }>();
const { totalDistance } = useRace();

const inputStyle = computed(() => {
  return {
    width: props.fluid ? '100%' : '80px',
  }
});

const distance = ref<number>(props.distance);

const emitUpdate = (e: InputNumberInputEvent) => {
  const value = e.value;
  emit('update', value);
};
</script>

<style lang="scss" scoped></style>
