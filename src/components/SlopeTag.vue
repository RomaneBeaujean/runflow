<template>
  <Tag
    v-if="percent !== null"
    :value="props.percent + ' %'"
    :style="tagStyle"
    class="inline-block mb-2 font-semibold"
  />
</template>

<script setup lang="ts">
import { Tag } from 'primevue';
import { computed } from 'vue';

const props = defineProps<{ percent: string | null }>();

const numericPercent = computed(() => {
  if (!props.percent) return 0;
  return Number(props.percent) || 0;
});

const tagStyle = computed(() => {
  const value = numericPercent.value;

  let background = '';
  let color = '#000';

  const absVal = Math.abs(value);

  if (absVal <= 5) {
    background = '#bbf7d0'; // vert pastel
    color = '#065f46';
  } else if (absVal <= 10) {
    background = '#fef08a'; // jaune pastel
    color = '#78350f';
  } else if (absVal <= 15) {
    background = '#fed7aa'; // orange pastel
    color = '#78350f';
  } else if (absVal <= 20) {
    background = '#fecaca'; // rouge pastel
    color = '#7f1d1d';
  } else {
    background = '#e0d7fd'; // violet pastel
    color = '#4c1d95';
  }

  return {
    backgroundColor: background,
    color: color,
  };
});
</script>
