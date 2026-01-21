<template>
  <div class="w-[300px]">
    <Select
      v-model="selectedTheme"
      :options="options"
      optionLabel="label"
      placeholder="Sélectionner ou créer un thème"
      class="w-full"
    >
      <!-- Valeur sélectionnée -->
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex items-center">
          <span
            class="color-dot"
            :style="{
              backgroundColor: slotProps.value.color,
              marginRight: '8px',
            }"
          />
          <div>{{ slotProps.value.label }}</div>
        </div>
        <div v-else>
          {{ slotProps.placeholder }}
        </div>
      </template>

      <!-- Options -->
      <template #option="{ option }">
        <div class="theme-item">
          <span class="color-dot" :style="{ backgroundColor: option.color }" />
          <span>{{ option.label }}</span>
        </div>
      </template>
    </Select>
  </div>
</template>
<script setup lang="ts">
import { TrainingWeek, WeekTheme } from '@/domain/types/TrainingPlan';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import Select from 'primevue/select';
import { computed, ref, watch } from 'vue';
const props = defineProps<{
  trainingWeek: TrainingWeek;
}>();
const { weekThemes, updateWeekTheme } = useTrainingPlan();
const selectedTheme = ref<WeekTheme | null>(props.trainingWeek.theme);
const options = computed(() => {
  return weekThemes.value.map(({ label, color }) => {
    return { label, color };
  });
});

watch(selectedTheme, () => {
  updateWeekTheme(props.trainingWeek.weekNumber, selectedTheme.value);
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
