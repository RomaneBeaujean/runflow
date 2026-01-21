<template>
  <div>
    <div class="w-full flex mt-2 mb-2 items-center justify-between">
      <div class="flex items-center font-semibold gap-3">
        <div class="mr-3 whitespace-nowrap">Semaine {{ trainingWeek.weekNumber }}</div>
        <SelectWeekTheme :trainingWeek="trainingWeek" />
      </div>
      <div>
        <Button
          icon="pi pi-trash"
          size="small"
          text
          @click="deleteWeek(trainingWeek.weekNumber)"
        />
      </div>
    </div>
    <div class="table-holder w-full">
      <table>
        <tbody>
          <tr>
            <template v-for="td in trainingWeek.days">
              <td>
                <div
                  class="h-[4px] w-full absolute top-0 left-0 z-10"
                  :style="{ backgroundColor: trainingWeek.theme?.color }"
                ></div>
                <TrainingPlanDay :trainingDay="td" />
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrainingWeek } from '@/domain/types/TrainingPlan';
import SelectWeekTheme from '@/ui/components/select/SelectWeekTheme.vue';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { Button } from 'primevue';
import TrainingPlanDay from './TrainingPlanDay.vue';

const props = defineProps<{
  trainingWeek: TrainingWeek;
}>();

const { deleteWeek } = useTrainingPlan();
</script>

<style scoped lang="scss">
.table-holder {
  table {
    box-sizing: border-box;
    border-collapse: collapse;
    background-color: white;
    border-radius: 8px;
    table-layout: fixed;
    width: 100%;
    min-width: calc(150px * 7);

    td {
      border: 1px solid var(--color-gray-300);
      min-width: 150px;
      height: 150px;
      position: relative;
    }
  }
}
</style>
