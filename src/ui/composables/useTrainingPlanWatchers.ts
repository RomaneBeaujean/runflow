import { watch } from 'vue';
import { useStores } from './useStores';
import { useTrainingPlan } from './useTrainingPlan';

export function useTrainingPlanWatchers() {
  const { id, weeks, name, weekThemes, sports, workoutModels } = useTrainingPlan();
  const stores = useStores();

  watch(
    [name, weeks, weekThemes, sports, workoutModels],
    () => {
      stores.training_plans_store.updateById(id.value, {
        weeks: weeks.value,
        name: name.value,
        weekThemes: weekThemes.value,
        sports: sports.value,
        workoutModels: workoutModels.value
      });
      console.log('✅ saved on db')
    },
    { deep: true, flush: 'post' }
  );
}
