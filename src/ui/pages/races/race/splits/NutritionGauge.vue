<template>
  <div class="flex flex-col gap-1">
    <div class="flex justify-between text-xs font-medium text-gray-600">
      <span>{{ label }}</span>
      <span :class="isComplete ? 'text-green-600 font-bold' : ''">
        {{ current }}{{ unit }}
        <span class="text-gray-400 font-normal"> / {{ target > 0 ? target : '—' }}{{ target > 0 ? unit : '' }}</span>
      </span>
    </div>
    <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-300"
        :class="isComplete ? 'bg-green-500' : 'bg-primary-400'"
        :style="{ width: percentage + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  current: number;
  target: number;
  unit: string;
}>();

const percentage = computed(() => {
  if (!props.target) return 0;
  return Math.min(100, Math.round((props.current / props.target) * 100));
});

const isComplete = computed(() => props.target > 0 && props.current >= props.target);
</script>
