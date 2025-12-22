import { watch } from 'vue';
import { useStores } from './useStores';
import { useTrainingPlan } from './useTrainingPlan';

export function useTrainingPlanWatchers() {
  const { trainingPlanName, trainingWeeks, trainingPlanId } = useTrainingPlan();
  const stores = useStores();

  watch(
    [trainingPlanName, trainingWeeks],
    () => {
      stores.training_plans_store.updateById(trainingPlanId.value, {
        training_weeks: trainingWeeks.value,
        name: trainingPlanName.value,
      });
    },
    { deep: true, flush: 'post' }
  );
}
