<template>
  <div
    class="p-[8px] rounded-md text-sm inline-flex  items-start gap-2 min-w-0 max-w-full truncate relative border-neutral-200 border-1">
    <div v-if="color" :class="['absolute top-0 bottom-0 left-0 w-[3px] rounded-tl-sm rounded-bl-sm', barBgColor]">
    </div>
    <div class="flex-shrink-0 empty:hidden">
      <slot name="left"></slot>
    </div>
    <div class="flex-1 min-w-0">
      <slot></slot>
    </div>
    <div class="flex-shrink-0 empty:hidden">
      <slot name="right"></slot>
    </div>
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
