<template>
  <Select :items="options" v-model:selected="selectedItem" showClear
    emptyMessage="Aucun modèle enregistré dans la bibliothèque" class="w-full" :disabled="options.length === 0"
    placeholder="Choisissez une séance" />
</template>

<script setup lang="ts">
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanHelper } from '@/ui/composables/useTrainingPlanHelper';
import { computed, ref, watch } from 'vue';
import Select from './Select.vue';

const props = defineProps<{
  selectedModelId: string | null;
}>();

const selectedItem = ref(null);

const { workoutModels } = useTrainingPlan();
const { getSport } = useTrainingPlanHelper();

const emit = defineEmits(['update:selectedModelId']);

const options = computed(() => {
  return workoutModels.value.map((el) => {
    return {
      value: el.id,
      label: el.title,
      icon: getSport(el.sportId)?.icon || null,
    }
  });
});

watch(selectedItem, () => {
  const itemId = selectedItem.value?.value || null;
  emit('update:selectedModelId', itemId);
});

watch(props, () => {
  if (props.selectedModelId !== selectedItem.value?.value) {
    const item = options.value.find((el) => el.value === props.selectedModelId);
    selectedItem.value = item || null;
  }
});
</script>

<style scoped></style>
