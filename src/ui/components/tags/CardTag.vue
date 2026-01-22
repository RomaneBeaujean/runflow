<template>
  <div
    class="p-[8px] rounded-sm text-sm inline-flex  items-start gap-2 min-w-0 max-w-full truncate relative border-neutral-200 border-1">
    <div v-if="color" class="absolute top-0 bottom-0 left-0 w-[3px] rounded-tl-sm rounded-bl-sm" :style="getBarStyle">
    </div>
    <div class="left flex-0 flex items-center flex-shrink-0 empty:hidden">
      <slot name="left"></slot>
    </div>
    <div class="middle flex-1 min-w-0">
      <slot></slot>
    </div>
    <div class="right flex-0 flex-shrink-0 flex items-center empty:hidden">
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

const getBarStyle = computed(() => {
  return {
    backgroundColor: 'var(--p-' + props.color + '-600)'
  }
})

</script>

<style scoped lang="scss"></style>
