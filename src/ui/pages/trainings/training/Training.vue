<template>
  <div v-if="id" id="training" class="flex flex-col items-center p-8">
    <Breadcrumb :model="items" class="text-sm"> </Breadcrumb>
    <div class="text-4xl p-3 truncate block max-w-full title-font text-center">
      {{ trainingPlanName }}
    </div>

    <div class="p-8">
      <TrainingCalendar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStores } from '@/ui/composables/useStores';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { Breadcrumb } from 'primevue';
import type { MenuItem } from 'primevue/menuitem';
import { onMounted, ref, watch } from 'vue';
import TrainingCalendar from './TrainingCalendar.vue';

const props = defineProps<{ id: string }>();
const stores = useStores();
const items = ref<MenuItem[]>([]);
const { init, trainingPlanName } = useTrainingPlan();

const initComposables = async () => {
  if (!props.id) return;
  const data = stores.training_plans_store.getById(props.id);
  if (!data) return;
  init(data);
};

onMounted(() => {
  initComposables();
  if (!props.id) return;
  items.value = [
    { label: "Plans d'entrainement", url: '/trainings' },
    { label: trainingPlanName.value, disabled: true },
  ];
});

watch(
  () => props.id,
  () => initComposables()
);
</script>

<style lang="scss"></style>
