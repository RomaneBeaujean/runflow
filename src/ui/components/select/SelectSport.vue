<template>
  <FloatLabel class="w-full" variant="in">
    <Select :items="sportsOptions" v-model:selected="selectedItem" inputId="sport" :disabled="readonly"
      :showClear="showClear" />
    <label for="sport">Sport pratiqué</label>
  </FloatLabel>
</template>

<script setup lang="ts">
import { Sport } from '@/domain/types/Sport';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { FloatLabel } from 'primevue';
import { computed, ref, watch } from 'vue';
import Select, { Item } from './Select.vue';

const { sports } = useTrainingPlan();
const props = defineProps<{
  selectedSport: Sport | null;
  showClear?: boolean;
  readonly?: boolean;
}>();
const emit = defineEmits(['update:selectedSport']);
const getSelectedItem = () => {
  return props.selectedSport
    ? {
      label: props.selectedSport.label,
      value: props.selectedSport.label,
      icon: props.selectedSport.icon,
    }
    : null
}

const selectedItem = ref<Item | null>(getSelectedItem());

const sportsOptions = computed(() => {
  return sports.value.map((el) => {
    return {
      label: el.label,
      icon: el.icon,
      value: el.label,
      selected: props.selectedSport === el
    };
  });
});


watch(props, () => {
  selectedItem.value = getSelectedItem();
});

watch(selectedItem, () => {
  const sport = selectedItem.value ? sports.value.find((el) => el.label === selectedItem.value.label) || null : null;
  if (props.selectedSport !== sport) {
    emit('update:selectedSport', sport);
  }
});
</script>

<style scoped></style>