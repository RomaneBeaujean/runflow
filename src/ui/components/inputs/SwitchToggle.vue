<template>
  <div :class="[
    'switch-toggle flex gap-2 cursor-pointer select-none mt-2 mb-2',
    display === 'row' ? 'flex-row items-center' : 'flex-col items-center text-center'
  ]">
    <ToggleSwitch v-model="internalValue" />
    <span class="text-sm inline-flex items-center font-semibold text-gray-700" @click="toggle">
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import ToggleSwitch from 'primevue/toggleswitch';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  label?: string;
  value?: boolean;
  display?: 'row' | 'col';
}>();

const emit = defineEmits(['update:value']);

const internalValue = ref(props.value);

const display = computed(() => {
  return props.display || 'row';
});

function toggle() {
  internalValue.value = !internalValue.value;
}

watch(internalValue, () => {
  emit("update:value", internalValue.value);
})

</script>
