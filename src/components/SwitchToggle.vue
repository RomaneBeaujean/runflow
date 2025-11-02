<template>
  <div
    class="switch-toggle flex gap-2 cursor-pointer select-none mt-2 mb-2"
    :class="
      display === 'row' ? 'flex-row' : 'flex-col items-center text-center'
    "
    @click="toggle"
  >
    <ToggleSwitch v-model="localValue" @click.stop />
    <span class="text-xs inline-flex items-center">
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import ToggleSwitch from 'primevue/toggleswitch';
import { computed } from 'vue';

const props = defineProps<{
  label?: string;
  modelValue?: boolean;
  display?: 'row' | 'col';
}>();

const emit = defineEmits(['update:modelValue']);

const display = computed(() => {
  return props.display || 'row';
});

const localValue = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

function toggle() {
  emit('update:modelValue', !props.modelValue);
}
</script>
