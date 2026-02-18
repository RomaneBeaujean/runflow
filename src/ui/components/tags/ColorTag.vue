<template>
  <div class="tag inline-flex min-w-0 max-w-full items-center gap-2 truncate text-sm" :style="tagStyle">
    <div class="left flex-0 flex items-center flex-shrink-0 empty:hidden">
      <i :class="icon" v-if="icon" />
      <slot name="left"></slot>
    </div>
    <div class="middle flex-1 min-w-0">
      {{ label }}
      <slot></slot>
    </div>
    <div class="right flex-0 flex-shrink-0 flex items-center empty:hidden">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getTagColor } from '@/domain/services/TagColors';
import { TagColor } from '@/domain/types/TagColor';
import { computed } from 'vue';


const props = defineProps<{
  label?: string;
  color?: TagColor;
  icon?: string;
  fluid?: boolean;
  size?: 'medium' | 'small' | 'xsmall';
  variant?: 'soft' | 'strong';
}>();


const colorKey = computed(() => props.color ?? 'neutral');
const variantKey = computed(() => props.variant ?? 'soft');

const tagStyle = computed(() => {
  const cfg = getTagColor(colorKey.value, variantKey.value);
  return {
    backgroundColor: cfg.background,
    color: cfg.color,
    width: props.fluid ? '100%' : 'auto',
    height: props.size === "medium" ? '24px' : "20px"
  };
});
</script>

<style scoped lang="scss">
.tag {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}
</style>
