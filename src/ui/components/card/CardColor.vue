<template>
  <div class="bg-white rounded-md flex flex-col p-3 border-1 relative border-gray-200 overflow-hidden">
    <div v-if="color" :class="['absolute top-0 bottom-0 left-0 w-[4px] rounded-tl-sm rounded-bl-sm', barBgColor]" />
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label?: string;
  color?: string;
  fluid?: boolean;
  size?: 'medium' | 'small' | 'xsmall';
  variant?: 'soft' | 'strong';
}>();

const barBgColor = computed(() => {
  return props.color;
})

</script>

<style scoped lang="scss"></style>
