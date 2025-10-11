<template>
  <td>
    <swm-table-cell width="100px">
      <InputTextMask :critical="critical" type="duration" v-model="value" />
    </swm-table-cell>
  </td>
</template>

<script setup lang="ts">
import InputTextMask from '@/ui/components/input/InputTextMask.vue';
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits(['update:modelValue']);
const critical = ref<boolean>(false);
const value = ref<string>(props.modelValue);

watch(value, (newVal) => {
  emit('update:modelValue', newVal);
  if (newVal?.match(/\d{0,1}\d[h]\d\d/)) {
    critical.value = false;
  } else {
    critical.value = true;
  }
});

watch(
  () => props.modelValue,
  (newVal) => {
    value.value = newVal;
  }
);
</script>

<style lang="scss" scoped></style>
