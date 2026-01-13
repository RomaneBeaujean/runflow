import { TrainingPlan, TrainingWeek } from '@/types/entities/TrainingPlan';
import { ref } from 'vue';
import { useTrainingPlanWatchers } from './useTrainingPlanWatchers';

const trainingPlanId = ref();
const trainingWeeks = ref<TrainingWeek[]>([]);
const trainingPlanName = ref<string>('');
const activeDay = ref(null);

export function useTrainingPlan() {
  const init = (tp: TrainingPlan) => {
    trainingPlanName.value = tp.name;
    trainingWeeks.value = tp.training_weeks;
    trainingPlanId.value = tp.id;

    if (trainingWeeks.value.length === 0) {
      trainingWeeks.value.push(new TrainingWeek({ week_number: 1 }));
    }

    useTrainingPlanWatchers();
  };

  const addNewWeek = () => {
    const week_number = trainingWeeks.value.length + 1;
    const newWeek = new TrainingWeek({ week_number });
    trainingWeeks.value = [...trainingWeeks.value, newWeek];
  };

  const updateDay = (
    day_number: number,
    week_number: number,
    training: string
  ) => {
    trainingWeeks.value = trainingWeeks.value.map((week) => {
      if (week.week_number === week_number) {
        return {
          ...week,
          training_days: week.training_days.map((day) => {
            if (day.day_number === day_number) {
              return { ...day, training };
            }
            return day;
          }),
        };
      }
      return week;
    });
  };

  const deleteWeek = (weekNumber: number) => {
    trainingWeeks.value = [...trainingWeeks.value]
      .filter((el) => el.week_number !== weekNumber)
      .map((el, index) => {
        return {
          ...el,
          week_number: index + 1,
        };
      });
  };

  return {
    init,
    addNewWeek,
    deleteWeek,
    updateDay,
    trainingWeeks,
    activeDay,
    trainingPlanId,
    trainingPlanName,
  };
}
