<template>
  <div
    class="switch-toggle flex items-center gap-2 cursor-pointer select-none mt-2 mb-2"
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
}>();

const emit = defineEmits(['update:modelValue']);

const localValue = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

function toggle() {
  emit('update:modelValue', !props.modelValue);
}
</script>
