<template>
  <InputNumber
    v-model="separator"
    mode="decimal"
    showButtons
    :min="0"
    :max="totalDistance - 0.1"
    :step="0.1"
    class="w-full"
    size="small"
    :disabled="props.split.startDistance === 0"
  />
</template>
<script lang="ts" setup>
import { useRace } from '@/composables/useRace';
import { Split } from '@/types/Split';
import { InputNumber } from 'primevue';
import { ref, watch } from 'vue';

const emit = defineEmits(['update']);

const props = defineProps<{ split: Split }>();
const { totalDistance } = useRace();

const separator = ref<number>(props.split.startDistance);

watch(separator, () => {
  emit('update', {
    ...props.split,
    startDistance: separator.value,
  });
});
</script>
