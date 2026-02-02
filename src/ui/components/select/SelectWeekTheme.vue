<template>
  <div class="w-[300px]">
    <SelectTag v-model:selected="selectedTheme" :items="options" placeholder="Thème de la semaine" showClear
      @update:item="updateWeekTheme" @delete:item="handleDeleteWeekTheme" />
  </div>
</template>
<script setup lang="ts">
import { TrainingWeek } from '@/domain/types/TrainingPlan';
import { WeekTheme } from '@/domain/types/WeekTheme';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanHelper } from '@/ui/composables/useTrainingPlanHelper';
import { computed, ref, watch } from 'vue';
import SelectTag, { Item } from './SelectTag.vue';
const props = defineProps<{
  trainingWeek: TrainingWeek;
}>();
const { weekThemes, updateThemeOfWeek, addWeekTheme, updateWeekTheme, deleteWeekTheme } = useTrainingPlan();
const { getWeekTheme } = useTrainingPlanHelper();

const getItemFromWeekTheme = (weekTheme: WeekTheme): Item => {
  if (!weekTheme) return null;
  const { label, id, color } = weekTheme;
  return { id, label, color }
}

const getWeekThemeFromItem = (item: Item): WeekTheme => {
  if (!item) return null;
  const { label, id, color } = item;
  return { id, label, color }
}

const selectedTheme = ref<Item | null>(getItemFromWeekTheme(getWeekTheme(props.trainingWeek.theme)));

const options = computed((): Item[] => {
  return weekThemes.value.map((wt) => {
    return getItemFromWeekTheme(wt);
  });
});

const handleDeleteWeekTheme = (deleted: WeekTheme) => {
  if (selectedTheme.value?.id == deleted.id) {
    selectedTheme.value = null;
  }
  deleteWeekTheme(deleted);
}

watch(selectedTheme, () => {
  const selectedWeekTheme = getWeekThemeFromItem(selectedTheme.value);
  if (selectedWeekTheme?.id === "new") {
    addWeekTheme(selectedWeekTheme);
    updateThemeOfWeek(props.trainingWeek.weekNumber, selectedWeekTheme);
  } else {
    updateThemeOfWeek(props.trainingWeek.weekNumber, selectedWeekTheme);
  }
});

watch(props.trainingWeek, () => {
  selectedTheme.value = getItemFromWeekTheme(getWeekTheme(props.trainingWeek.theme));
});
</script>
<style scoped>
.theme-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
</style>
