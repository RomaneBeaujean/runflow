<template>
  <ColorTag
    v-if="slope !== null"
    :color="tagColor"
    :icon="icon"
    :size="size"
    :fluid="fluid"
  >
    <slot></slot>
  </ColorTag>
</template>

<script setup lang="ts">
import ColorTag, { TagColor } from '@/ui/components/tags/ColorTag.vue';
import { computed } from 'vue';

const props = defineProps<{
  slope: string | null;
  icon?: string;
  fluid?: boolean;
  size?: 'small' | 'medium';
}>();

const numericPercent = computed(() => {
  if (!props.slope) return 0;
  return Number(props.slope) || 0;
});

const tagColor = computed((): TagColor => {
  const value = numericPercent.value;
  const absVal = Math.abs(value);

  if (absVal <= 5) {
    return 'green';
  } else if (absVal <= 10) {
    return 'brown';
  } else if (absVal <= 15) {
    return 'deep-orange';
  } else if (absVal <= 20) {
    return 'red';
  } else {
    return 'deep-purple';
  }
});
</script>
