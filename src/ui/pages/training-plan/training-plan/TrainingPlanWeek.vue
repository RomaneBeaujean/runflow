<template>
  <div>
    <div class="w-full flex mt-2 mb-2 items-center justify-between">
      <div class="flex items-center font-semibold gap-3">
        <div class="mr-3 whitespace-nowrap">Semaine {{ trainingWeek.weekNumber }}</div>
        <SelectWeekTheme :trainingWeek="trainingWeek" />
      </div>
      <div>
        <Button icon="pi pi-trash" size="small" text @click="deleteWeek(trainingWeek.weekNumber)" />
      </div>
    </div>
    <div class="table-holder w-full">
      <table>
        <tbody>
          <tr>
            <template v-for="td in trainingWeek.days">
              <td>
                <div class="h-[4px] w-full absolute top-0 left-0 z-10"
                  :style="{ backgroundColor: trainingWeek.theme?.color }"></div>
                <TrainingPlanDay :trainingDay="td" />
              </td>
            </template>
            <td>
              <div class="h-[4px] w-full absolute top-0 left-0 z-10"
                :style="{ backgroundColor: trainingWeek.theme?.color }"></div>
              <div class="w-full h-full flex flex-col p-3 bg-neutral-100">
                <div class="text-sm font-semibold full-w text-center mb-3 text-neutral-500">Totaux hebdomadaires</div>
                <div v-for="sportStat in getWeekStats(trainingWeek)">
                  <ColorTag :color="createSportTagColor(sportStat.sport.color)"
                    v-if="sportStat.totalDistance > 0 || sportStat.totalDuration > 0" class="mb-3">
                    <i :class="sportStat.sport.icon" class="mr-1" />
                    <span v-if="sportStat.totalDistance > 0">{{ sportStat.totalDistance }} km</span>
                    <span v-if="sportStat.totalDistance > 0 && sportStat.totalDuration > 0"> - </span>
                    <span v-if="sportStat.totalDuration > 0">{{ minutesToFormattedDuration(sportStat.totalDuration)
                      }}</span>

                  </ColorTag>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createSportTagColor } from '@/domain/factories/WorkoutFactory';
import { minutesToFormattedDuration } from '@/domain/helpers/Time.helper';
import { TrainingWeek } from '@/domain/types/TrainingPlan';
import SelectWeekTheme from '@/ui/components/select/SelectWeekTheme.vue';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanHelper } from '@/ui/composables/useTrainingPlanHelper';
import { Button } from 'primevue';
import TrainingPlanDay from './TrainingPlanDay.vue';

const props = defineProps<{
  trainingWeek: TrainingWeek;
}>();

const { getWeekStats } = useTrainingPlanHelper();
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
