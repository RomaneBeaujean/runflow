<template>
  <InputNumber
    v-model="distance"
    mode="decimal"
    showButtons
    :min="0"
    :max="totalDistance - 0.1"
    :step="0.1"
    style="width: 70px"
    size="small"
  />
</template>
<script lang="ts" setup>
import { useRace } from '@/composables/useRace';
import { InputNumber } from 'primevue';
import { ref, watch } from 'vue';

const emit = defineEmits(['update']);

const props = defineProps<{ distance: number }>();
const { totalDistance } = useRace();

const distance = ref<number>(props.distance);

watch(distance, () => {
  emit('update', {
    distance: distance.value,
  });
});
</script>

<style lang="scss" scoped></style>
